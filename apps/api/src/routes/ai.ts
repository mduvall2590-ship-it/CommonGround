import { Hono } from 'hono';
import { db } from '../db';
import { proposals, comments, expenses, budgets, maintenanceRequests, aiSummaries, auditLogs, auditLog } from 'db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { jwt } from 'hono/jwt';
import { JWT_SECRET } from './auth';

const ai = new Hono();

// AI routes require authentication
ai.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));

// AI Facilitator: Draft Proposal
ai.post('/facilitator/draft', async (c) => {
  const { intent, neighborhoodId } = await c.req.json();
  if (!intent) return c.json({ error: { message: 'Intent is required' } }, 400);

  // Mock AI drafting logic
  const draft = {
    title: `Proposal: ${intent.substring(0, 30)}${intent.length > 30 ? '...' : ''}`,
    description: `Community improvement based on resident intent: "${intent}".\n\nThis proposal addresses the community's desire for improvements while ensuring financial responsibility.`,
    type: intent.toLowerCase().includes('money') || intent.toLowerCase().includes('cost') || intent.toLowerCase().includes('spend') ? 'FINANCIAL' : 'OPERATIONAL',
    options: ['APPROVE', 'REJECT'],
    rationale: "Automatically drafted by AI Facilitator to streamline community governance.",
  };

  return c.json({ data: draft });
});

// AI Facilitator: Summarize Discussion
ai.get('/facilitator/summarize/:proposalId', async (c) => {
  const proposalId = c.req.param('proposalId');
  
  try {
    const proposalComments = await db.select().from(comments).where(eq(comments.proposalId, proposalId)).all();
    
    if (proposalComments.length === 0) {
      return c.json({ data: { summary: "No discussion yet.", sentimentScore: 0, keyPoints: [] } });
    }

    // Mock summarization logic
    const summaryText = `The community has contributed ${proposalComments.length} comments. Overall, there is a constructive dialogue focusing on the long-term benefits and immediate costs.`;
    const sentimentScore = 0.5; // Slightly positive mock sentiment
    const keyPoints = [
      { point: "General agreement on the necessity of the project.", type: "FOR" },
      { point: "Concerns raised about the implementation timeline.", type: "AGAINST" },
      { point: "Suggestion to phase the rollout over two quarters.", type: "ALTERNATIVE" }
    ];

    // Persist summary
    const summaryId = uuidv4();
    await db.insert(aiSummaries).values({
      id: summaryId,
      proposalId,
      summaryText,
      sentimentScore: Math.round(sentimentScore * 100), 
      keyPointsJson: JSON.stringify(keyPoints),
      updatedAt: Date.now()
    }).onConflictDoUpdate({
      target: aiSummaries.proposalId,
      set: {
        summaryText,
        sentimentScore: Math.round(sentimentScore * 100),
        keyPointsJson: JSON.stringify(keyPoints),
        updatedAt: Date.now()
      }
    }).run();

    return c.json({ data: { summary: summaryText, sentimentScore, keyPoints } });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// AI Facilitator: Explain Jargon
ai.post('/facilitator/explain', async (c) => {
  const { term, context } = await c.req.json();
  
  const glossary: Record<string, string> = {
    "Quorum": "The minimum number of residents who must vote for the result to be valid.",
    "Fiduciary Duty": "The legal obligation of the Board to act in the best interest of the community.",
    "Special Assessment": "A one-time fee charged to homeowners to cover large, unexpected expenses.",
    "Reserve Fund": "Savings set aside for major long-term repairs, like roof replacement or road repaving."
  };

  const explanation = glossary[term] || `In this context, ${term} refers to the formal process or requirement defined in the neighborhood's governing documents.`;

  return c.json({ data: { explanation } });
});

// Verification logic exported for internal use
export async function verifyExpenseInternal(expenseId: string) {
  const expense = await db.select().from(expenses).where(eq(expenses.id, expenseId)).get();
  if (!expense) throw new Error('Expense not found');

  let status: 'VERIFIED' | 'FLAGGED' = 'FLAGGED';
  let source: 'BUDGET' | 'PROPOSAL' | 'EMERGENCY' | undefined;
  let sourceId: string | undefined;
  let reasoning = "No automatic authorization source found.";
  let confidenceScore = 0;

  // 1. Check Proposal Link
  if (expense.proposalId) {
    const proposal = await db.select().from(proposals).where(eq(proposals.id, expense.proposalId)).get();
    if (proposal && proposal.status === 'PASSED') {
      status = 'VERIFIED';
      source = 'PROPOSAL';
      sourceId = proposal.id;
      reasoning = `Expense matches Passed Proposal #${proposal.id}: "${proposal.title}".`;
      confidenceScore = 95;
    }
  }

  // 2. Check Budget Match & Overflow
  if (status === 'FLAGGED') {
    const matchingBudgets = await db.select().from(budgets).where(and(eq(budgets.neighborhoodId, expense.neighborhoodId), eq(budgets.category, expense.category))).all();
    if (matchingBudgets.length > 0) {
      const budget = matchingBudgets[0];
      if (budget) {
        // Calculate total spent in this category
        const totalSpentResult = await db.select({ total: sql<number>`sum(${expenses.amount})` })
          .from(expenses)
          .where(and(eq(expenses.neighborhoodId, expense.neighborhoodId), eq(expenses.category, expense.category)))
          .get();
        
        const totalSpent = totalSpentResult?.total || 0;

        if (totalSpent > budget.amountCents * 1.1) {
          status = 'FLAGGED';
          reasoning = "Spending in category \"" + expense.category + "\" exceeds budget by >10% ($" + (totalSpent/100).toFixed(2) + " / $" + (budget.amountCents/100).toFixed(2) + ").";
          confidenceScore = 90;
        } else {
          status = 'VERIFIED';
          source = 'BUDGET';
          sourceId = budget.id;
          reasoning = `Expense aligns with approved budget category: "${expense.category}".`;
          confidenceScore = 85;
        }
      }
    }
  }

  // 3. Check Duplicate Invoice (Mock logic: same amount and category in last 24h)
  if (status === 'VERIFIED') {
    const duplicates = await db.select().from(expenses)
      .where(and(
        eq(expenses.neighborhoodId, expense.neighborhoodId),
        eq(expenses.amount, expense.amount),
        eq(expenses.category, expense.category),
        sql`${expenses.createdAt} > ${Date.now() - 24 * 60 * 60 * 1000}`,
        sql`${expenses.id} != ${expense.id}`
      )).all();
    
    if (duplicates.length > 0) {
      status = 'FLAGGED';
      reasoning = `Potential duplicate detected. Another expense of same amount and category created in last 24 hours.`;
      confidenceScore = 95;
    }
  }

  // Persist Audit Log
  const auditId = uuidv4();
  await db.insert(auditLogs).values({
    id: auditId,
    expenseId,
    status,
    authorizationSourceType: source as any,
    authorizationSourceId: sourceId,
    reasoning,
    confidenceScore,
    createdAt: Date.now()
  }).run();

  return { id: auditId, status, reasoning, confidenceScore };
}

// AI Auditor: Verify Expense
ai.post('/auditor/verify/:expenseId', async (c) => {
  const expenseId = c.req.param('expenseId');

  try {
    const result = await verifyExpenseInternal(expenseId);
    return c.json({ data: result });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// AI Auditor: Anomaly Detection
ai.get('/auditor/anomalies', async (c) => {
  const neighborhoodId = c.req.query('neighborhoodId');
  if (!neighborhoodId) return c.json({ error: { message: 'neighborhoodId is required' } }, 400);

  try {
    const unverifiedLogs = await db.select()
      .from(auditLogs)
      .innerJoin(expenses, eq(auditLogs.expenseId, expenses.id))
      .where(and(eq(expenses.neighborhoodId, neighborhoodId), eq(auditLogs.status, 'FLAGGED')))
      .all();

    const anomalies = unverifiedLogs.map((l: any) => ({
      expenseId: l.expenses.id,
      description: l.expenses.description,
      amount: l.expenses.amount,
      reason: "Unlinked spending detected. No matching proposal or budget allocation found."
    }));

    return c.json({ data: anomalies });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

export { ai };
