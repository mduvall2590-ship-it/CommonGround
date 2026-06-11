import { Hono } from 'hono';
import { db } from '../db';
import { expenses, budgets, dues, neighborhoodConfigs, proposals, properties, auditLog, users } from 'db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { ExpenseSchema, BudgetSchema } from 'types';
import { zValidator } from '@hono/zod-validator';
import { jwt } from 'hono/jwt';
import { JWT_SECRET } from './auth';
import { verifyExpenseInternal } from './ai';

const financials = new Hono();

// All financial routes require authentication
financials.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));

// Get Community Ledger (Expenses and Dues Summary)
financials.get('/ledger', async (c) => {
  let neighborhoodId = c.req.query('neighborhoodId');
  
  if (!neighborhoodId) {
    const payload = c.get('jwtPayload') as any;
    const user = await db.select().from(users).where(eq(users.id, payload.id)).get();
    neighborhoodId = user?.neighborhoodId;
  }

  if (!neighborhoodId) return c.json({ error: { message: 'neighborhoodId is required' } }, 400);

  try {
    const allExpenses = await db.select()
      .from(expenses)
      .where(eq(expenses.neighborhoodId, neighborhoodId))
      .orderBy(desc(expenses.createdAt))
      .all();

    const allBudgets = await db.select()
      .from(budgets)
      .where(eq(budgets.neighborhoodId, neighborhoodId))
      .all();

    const totalBudgetCents = allBudgets.reduce((sum: number, b: any) => sum + b.amountCents, 0);
    const categories = allBudgets.map((b: any) => ({
      label: b.category,
      percentage: totalBudgetCents > 0 ? Math.round((b.amountCents / totalBudgetCents) * 100) : 0,
      color: b.category === 'Landscaping' ? '#0D7C8C' : (b.category === 'Utilities' ? '#E8A838' : '#2D6A4F')
    }));

    return c.json({ 
      data: { 
        expenses: allExpenses,
        budgets: allBudgets,
        categories: categories.length > 0 ? categories : [
          { label: 'Landscaping', percentage: 40, color: '#0D7C8C' },
          { label: 'Reserve', percentage: 25, color: '#2D6A4F' },
          { label: 'Utilities', percentage: 20, color: '#E8A838' },
          { label: 'Insurance', percentage: 15, color: '#E86A5E' },
        ],
        totalDues: 85
      } 
    });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Create an Expense
financials.post('/expenses', zValidator('json', ExpenseSchema.omit({ id: true, createdAt: true })), async (c) => {
  const payload = c.get('jwtPayload') as any;
  const userId = payload.id;
  const input = c.req.valid('json');

  try {
    const config = await db.select().from(neighborhoodConfigs).where(eq(neighborhoodConfigs.neighborhoodId, input.neighborhoodId)).get();
    const threshold = config?.expenseThresholdCents ?? 50000;

    // Check if it exceeds threshold and has a linked proposal
    if (input.amount > threshold && !input.proposalId) {
      return c.json({ error: { message: `Expenses over $${threshold/100} require a linked approved proposal.` } }, 400);
    }

    if (input.proposalId) {
      const proposal = await db.select().from(proposals).where(eq(proposals.id, input.proposalId)).get();
      if (!proposal || proposal.status !== 'PASSED') {
        return c.json({ error: { message: 'Linked proposal must be PASSED.' } }, 400);
      }
    }

    const newExpense = {
      id: uuidv4(),
      ...input,
      createdAt: Date.now(),
    };

    await db.insert(expenses).values(newExpense).run();

    // AI Auditor Hook
    try {
      console.log(`[AI Auditor] Analyzing expense ${newExpense.id}...`);
      await verifyExpenseInternal(newExpense.id);
    } catch (e) {
      console.error('AI Auditor failed:', e);
    }

    // Log action
    await db.insert(auditLog).values({
      id: uuidv4(),
      neighborhoodId: input.neighborhoodId,
      userId,
      action: 'CREATE_EXPENSE',
      entityType: 'EXPENSE',
      entityId: newExpense.id,
      metadata: JSON.stringify({ amount: input.amount, category: input.category }),
      createdAt: Date.now(),
    }).run();

    return c.json({ data: newExpense });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Get Dues for a property or neighborhood
financials.get('/dues', async (c) => {
  const neighborhoodId = c.req.query('neighborhoodId');
  const propertyId = c.req.query('propertyId');

  try {
    if (propertyId) {
      const propertyDues = await db.select().from(dues).where(eq(dues.propertyId, propertyId)).all();
      return c.json({ data: propertyDues });
    }

    if (neighborhoodId) {
       // This is a bit complex in Drizzle with join, let's keep it simple for now or use raw sql if needed
       // For MVP, just return all dues linked to properties in this neighborhood
       const results = await db.select({
         due: dues,
         address: properties.address
       })
       .from(dues)
       .innerJoin(properties, eq(dues.propertyId, properties.id))
       .where(eq(properties.neighborhoodId, neighborhoodId))
       .all();
       
       return c.json({ data: results });
    }

    return c.json({ error: { message: 'neighborhoodId or propertyId required' } }, 400);
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Mark Dues as Paid (Admin only)
financials.post('/dues/:id/pay', async (c) => {
  const id = c.req.param('id');
  const payload = c.get('jwtPayload') as any;
  
  // Check if admin
  if (payload.role !== 'ADMIN') {
    return c.json({ error: { message: 'Unauthorized. Admin only.' } }, 403);
  }

  try {
    await db.update(dues)
      .set({ status: 'PAID', paidAt: Date.now() })
      .where(eq(dues.id, id))
      .run();

    return c.json({ data: { id, status: 'PAID' } });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

export { financials };
