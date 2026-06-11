import { Hono } from 'hono';
import { db } from '../db';
import { improvementIdeas, improvementUpvotes, proposals, auditLog, users, neighborhoodConfigs } from 'db';
import { eq, and, sql, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const improvements = new Hono();

// Get all ideas for a neighborhood
improvements.get('/', async (c) => {
  const neighborhoodId = c.req.query('neighborhoodId');
  if (!neighborhoodId) return c.json({ error: 'Neighborhood ID required' }, 400);
  
  const ideas = await db.select({
    id: improvementIdeas.id,
    userId: improvementIdeas.userId,
    userName: users.name,
    title: improvementIdeas.title,
    description: improvementIdeas.description,
    status: improvementIdeas.status,
    upvotesCount: improvementIdeas.upvotesCount,
    proposalId: improvementIdeas.proposalId,
    createdAt: improvementIdeas.createdAt,
  })
    .from(improvementIdeas)
    .innerJoin(users, eq(improvementIdeas.userId, users.id))
    .where(eq(improvementIdeas.neighborhoodId, neighborhoodId))
    .orderBy(sql`${improvementIdeas.upvotesCount} DESC`);
    
  const residentsCountResult = await db.select({ value: count() }).from(users).where(eq(users.neighborhoodId, neighborhoodId));
  const residentsCount = residentsCountResult[0]?.value || 0;

  return c.json({ data: ideas, residentsCount });
});

// Create a new idea
improvements.post('/', async (c) => {
  const body = await c.req.json();
  const { neighborhoodId, userId, title, description } = body;
  
  if (!neighborhoodId || !userId || !title || !description) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const id = uuidv4();
  const now = Date.now();
  
  await db.insert(improvementIdeas).values({
    id,
    neighborhoodId,
    userId,
    title,
    description,
    status: 'ACTIVE',
    upvotesCount: 0,
    createdAt: now,
  });
  
  return c.json({ data: { id, status: 'ACTIVE' } });
});

// Upvote an idea
improvements.post('/:id/upvote', async (c) => {
  const ideaId = c.req.param('id');
  const { userId } = await c.req.json();
  
  if (!userId) return c.json({ error: 'User ID required' }, 400);

  // Check if already upvoted
  const existing = await db.select()
    .from(improvementUpvotes)
    .where(and(eq(improvementUpvotes.ideaId, ideaId), eq(improvementUpvotes.userId, userId)));
  
  if (existing.length > 0) {
    return c.json({ error: 'Already upvoted' }, 400);
  }

  const upvoteId = uuidv4();
  const now = Date.now();

  await db.transaction(async (tx: any) => {
    await tx.insert(improvementUpvotes).values({
      id: upvoteId,
      ideaId,
      userId,
      createdAt: now,
    });

    await tx.update(improvementIdeas)
      .set({ upvotesCount: sql`${improvementIdeas.upvotesCount} + 1` })
      .where(eq(improvementIdeas.id, ideaId));
  });

  // Check threshold (20% of residents)
  const idea = (await db.select().from(improvementIdeas).where(eq(improvementIdeas.id, ideaId)))[0];
  if (!idea) return c.json({ error: 'Idea not found' }, 404);

  const residentsCountResult = await db.select({ value: count() }).from(users).where(eq(users.neighborhoodId, idea.neighborhoodId));
  const residentsCount = residentsCountResult[0]?.value || 0;
  
  const config = (await db.select().from(neighborhoodConfigs).where(eq(neighborhoodConfigs.neighborhoodId, idea.neighborhoodId)))[0];
  const thresholdPercent = config?.defaultQuorum || 20;
  const thresholdValue = Math.ceil(residentsCount * (thresholdPercent / 100));

  if (idea.upvotesCount + 1 >= thresholdValue && idea.status === 'ACTIVE') {
    // Flag for board review or mark as high support
  }

  return c.json({ success: true, upvotesCount: idea.upvotesCount + 1 });
});

// Convert idea to proposal (Admin only)
improvements.post('/:id/propose', async (c) => {
  const ideaId = c.req.param('id');
  const body = await c.req.json();
  const { adminId, title, description, rationale } = body;

  const idea = (await db.select().from(improvementIdeas).where(eq(improvementIdeas.id, ideaId)))[0];
  if (!idea) return c.json({ error: 'Idea not found' }, 404);

  const admin = (await db.select().from(users).where(eq(users.id, adminId)))[0];
  if (!admin || admin.role !== 'ADMIN') return c.json({ error: 'Unauthorized' }, 403);

  const proposalId = uuidv4();
  const config = (await db.select().from(neighborhoodConfigs).where(eq(neighborhoodConfigs.neighborhoodId, idea.neighborhoodId)))[0];

  await db.transaction(async (tx: any) => {
    await tx.insert(proposals).values({
      id: proposalId,
      neighborhoodId: idea.neighborhoodId,
      proposerId: adminId,
      title: title || `Improvement: ${idea.title}`,
      description: description || idea.description,
      type: 'OPERATIONAL', 
      rationale: rationale || `Based on community idea with ${idea.upvotesCount} upvotes.`,
      options: JSON.stringify(['APPROVE', 'REJECT']),
      status: 'DISCUSSION',
      quorumRequired: config?.defaultQuorum || 20,
      thresholdRequired: config?.defaultThreshold || 51,
      votingEndsAt: Date.now() + (config?.defaultVotingPeriodDays || 7) * 24 * 60 * 60 * 1000,
      createdAt: Date.now(),
      metadata: JSON.stringify({ ideaId: ideaId })
    });

    await tx.update(improvementIdeas)
      .set({ status: 'PROPOSED', proposalId })
      .where(eq(improvementIdeas.id, ideaId));

    await tx.insert(auditLog).values({
      id: uuidv4(),
      neighborhoodId: idea.neighborhoodId,
      userId: adminId,
      action: 'IDEA_CONVERTED_TO_PROPOSAL',
      entityType: 'IMPROVEMENT_IDEA',
      entityId: ideaId,
      metadata: JSON.stringify({ proposalId }),
      createdAt: Date.now()
    });
  });

  return c.json({ data: { proposalId } });
});
