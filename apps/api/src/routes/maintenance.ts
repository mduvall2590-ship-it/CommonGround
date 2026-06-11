import { Hono } from 'hono';
import { db } from '../db';
import { maintenanceRequests, vendors, quotes, proposals, auditLog, neighborhoodConfigs, properties, users } from 'db';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { jwt } from 'hono/jwt';
import { JWT_SECRET } from './auth';

export const maintenance = new Hono();

// Require auth
maintenance.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));

// Helper for AI triage
function suggestCategory(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  if (text.includes('leak') || text.includes('plumbing') || text.includes('pipe') || text.includes('water')) return 'Plumbing';
  if (text.includes('light') || text.includes('electrical') || text.includes('wire') || text.includes('outlet')) return 'Electrical';
  if (text.includes('grass') || text.includes('lawn') || text.includes('tree') || text.includes('landscaping') || text.includes('sprinkler')) return 'Landscaping';
  if (text.includes('gate') || text.includes('fence') || text.includes('security') || text.includes('camera')) return 'Security';
  if (text.includes('pool') || text.includes('swim')) return 'Pool';
  return 'General';
}

// Get all requests for a neighborhood
maintenance.get('/', async (c) => {
  let neighborhoodId = c.req.query('neighborhoodId');
  
  if (!neighborhoodId) {
    const payload = c.get('jwtPayload') as any;
    const user = await db.select().from(users).where(eq(users.id, payload.id)).get();
    neighborhoodId = user?.neighborhoodId;
  }

  if (!neighborhoodId) return c.json({ error: 'Neighborhood ID required' }, 400);
  
  const requests = await db.select({
    id: maintenanceRequests.id,
    propertyId: maintenanceRequests.propertyId,
    requesterId: maintenanceRequests.requesterId,
    title: maintenanceRequests.title,
    description: maintenanceRequests.description,
    category: maintenanceRequests.category,
    status: maintenanceRequests.status,
    priority: maintenanceRequests.priority,
    createdAt: maintenanceRequests.createdAt,
    vendorId: maintenanceRequests.vendorId,
    rating: maintenanceRequests.rating,
    feedback: maintenanceRequests.feedback,
  })
    .from(maintenanceRequests)
    .innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
    .where(eq(properties.neighborhoodId, neighborhoodId))
    .all();
    
  return c.json({ data: requests });
});

// Create a new request
maintenance.post('/', async (c) => {
  const body = await c.req.json();
  const { propertyId, requesterId, title, description, priority } = body;
  
  const category = suggestCategory(title, description || '');
  
  const id = uuidv4();
  const now = Date.now();
  
  await db.insert(maintenanceRequests).values({
    id,
    propertyId,
    requesterId,
    title,
    description,
    category,
    status: 'SUBMITTED',
    priority: priority || 'MEDIUM',
    createdAt: now,
  });
  
  return c.json({ data: { id, category, status: 'SUBMITTED' } });
});

// Update status
maintenance.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status, vendorId } = await c.req.json();
  
  await db.update(maintenanceRequests)
    .set({ status, vendorId })
    .where(eq(maintenanceRequests.id, id));
    
  return c.json({ success: true });
});

// Submit quote
maintenance.post('/:id/quotes', async (c) => {
  const requestId = c.req.param('id');
  const body = await c.req.json();
  const { vendorId, amountCents, notes } = body;
  
  const id = uuidv4();
  await db.insert(quotes).values({
    id,
    requestId,
    vendorId,
    amountCents,
    status: 'PENDING',
    createdAt: Date.now(),
    notes
  });
  
  // Integration: High-cost repairs trigger Financial Proposal
  // 1. Get neighborhood threshold
  const request = (await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, requestId)))[0];
  if (!request) return c.json({ error: 'Request not found' }, 404);

  const property = (await db.select().from(properties).where(eq(properties.id, request.propertyId)))[0];
  if (!property) return c.json({ error: 'Property not found' }, 404);

  const config = (await db.select().from(neighborhoodConfigs).where(eq(neighborhoodConfigs.neighborhoodId, property.neighborhoodId)))[0];
  
  const threshold = config?.expenseThresholdCents || 50000;
  
  if (amountCents > threshold) {
    // Generate Financial Proposal
    const proposalId = uuidv4();
    await db.insert(proposals).values({
      id: proposalId,
      neighborhoodId: property.neighborhoodId,
      proposerId: request.requesterId, // Board might want to be proposer, but requester is fine for MVP
      title: `Special Expenditure: ${request.title}`,
      description: `Emergency repair request for ${request.category}. Quote received for $${(amountCents/100).toFixed(2)}. Notes: ${notes}`,
      type: 'FINANCIAL',
      options: JSON.stringify(['APPROVE', 'REJECT']),
      status: 'DISCUSSION',
      quorumRequired: config?.defaultQuorum || 20,
      thresholdRequired: config?.defaultThreshold || 51,
      votingEndsAt: Date.now() + (config?.defaultVotingPeriodDays || 7) * 24 * 60 * 60 * 1000,
      createdAt: Date.now(),
      metadata: JSON.stringify({ maintenanceRequestId: requestId, quoteId: id })
    });
    
    await db.insert(auditLog).values({
      id: uuidv4(),
      neighborhoodId: property.neighborhoodId,
      action: 'PROPOSAL_GENERATED',
      entityType: 'MAINTENANCE_REQUEST',
      entityId: requestId,
      metadata: JSON.stringify({ proposalId, amountCents }),
      createdAt: Date.now()
    });
  }
  
  return c.json({ data: { id, proposalTriggered: amountCents > threshold } });
});

// Resident feedback
maintenance.post('/:id/feedback', async (c) => {
  const id = c.req.param('id');
  const { rating, feedback } = await c.req.json();
  
  await db.update(maintenanceRequests)
    .set({ rating, feedback, status: 'RESOLVED' })
    .where(eq(maintenanceRequests.id, id));
    
  return c.json({ success: true });
});

// Vendor Directory
maintenance.get('/vendors', async (c) => {
  const neighborhoodId = c.req.query('neighborhoodId');
  const vendorList = await db.select().from(vendors);
  return c.json({ data: vendorList });
});
