import { Hono } from 'hono';
import { db } from '../db';
import { neighborhoods, proposals, maintenanceRequests, users, expenses, auditLog, budgets, dues, properties, ballots } from 'db';
import { eq, and, not, desc, gte } from 'drizzle-orm';
import { jwt } from 'hono/jwt';
import { JWT_SECRET } from './auth';

const dashboard = new Hono();

dashboard.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));

dashboard.get('/', async (c) => {
  const payload = c.get('jwtPayload') as any;
  const userId = payload.id;

  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user || !user.neighborhoodId) {
      return c.json({ error: { message: 'User or neighborhood not found' } }, 404);
    }

    const neighborhoodData = await db.select().from(neighborhoods).where(eq(neighborhoods.id, user.neighborhoodId)).get();
    if (!neighborhoodData) {
      return c.json({ error: { message: 'Neighborhood not found' } }, 404);
    }

    // 1. Metrics
    const activeProposals = await db.select().from(proposals)
      .where(and(eq(proposals.neighborhoodId, user.neighborhoodId), eq(proposals.status, 'VOTING')))
      .all();
    
    const openRepairs = await db.select({ id: maintenanceRequests.id })
      .from(maintenanceRequests)
      .innerJoin(users, eq(maintenanceRequests.requesterId, users.id))
      .where(and(eq(users.neighborhoodId, user.neighborhoodId), not(eq(maintenanceRequests.status, 'RESOLVED'))))
      .all();

    // Check if user has paid dues
    const property = await db.select()
      .from(properties)
      .where(and(eq(properties.ownerId, userId), eq(properties.neighborhoodId, user.neighborhoodId)))
      .get();
    
    let duesPaid = true;
    if (property) {
      const unpaidDues = await db.select().from(dues)
        .where(and(eq(dues.propertyId, property.id), eq(dues.status, 'PENDING')))
        .all();
      duesPaid = unpaidDues.length === 0;
    }

    // 2. Community Pulse (mock for now or based on recent ballots)
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentVotes = await db.select().from(ballots)
      .innerJoin(proposals, eq(ballots.proposalId, proposals.id))
      .where(and(eq(proposals.neighborhoodId, user.neighborhoodId), gte(ballots.createdAt, twentyFourHoursAgo)))
      .all();

    const activeResidents = await db.select().from(users)
      .where(eq(users.neighborhoodId, user.neighborhoodId))
      .all();

    // 3. Financial Snapshot
    const currentYear = new Date().getFullYear();
    const neighborhoodBudgets = await db.select().from(budgets)
      .where(and(eq(budgets.neighborhoodId, user.neighborhoodId), eq(budgets.year, currentYear)))
      .all();
    
    const totalBudget = neighborhoodBudgets.reduce((sum: number, b: any) => sum + b.amountCents, 0);
    const financialCategories = neighborhoodBudgets.map((b: any) => ({
      label: b.category,
      percentage: totalBudget > 0 ? Math.round((b.amountCents / totalBudget) * 100) : 0,
      color: b.category === 'Landscaping' ? '#0D7C8C' : (b.category === 'Utilities' ? '#E8A838' : '#2D6A4F')
    }));

    // 4. Recent Activity (Audit logs + new proposals)
    const activityLogs = await db.select().from(auditLog)
      .where(eq(auditLog.neighborhoodId, user.neighborhoodId))
      .orderBy(desc(auditLog.createdAt))
      .limit(5)
      .all();

    const recentActivity = activityLogs.map((log: any) => ({
      id: log.id,
      type: log.action.toLowerCase(),
      title: `${log.action.replace('_', ' ')}: ${log.entityType}`,
      timestamp: new Date(log.createdAt).toLocaleDateString()
    }));

    // Final Payload
    return c.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          neighborhoodId: user.neighborhoodId
        },
        neighborhood: {
          id: neighborhoodData.id,
          name: neighborhoodData.name,
          location: neighborhoodData.location,
          memberCount: activeResidents.length,
          totalDues: 85, // Mock or calculate from DB
          duesPeriod: 'month'
        },
        metrics: {
          activeVotes: activeProposals.length,
          openRepairs: openRepairs.length,
          duesPaid
        },
        communityPulse: {
          activeCount: Math.ceil(activeResidents.length * 0.4), // Mock active count
          totalCount: activeResidents.length,
          votesLast24h: recentVotes.length
        },
        financialSnapshot: {
          totalDues: 85,
          period: 'month',
          categories: financialCategories.length > 0 ? financialCategories : [
            { label: 'Landscaping', percentage: 40, color: '#0D7C8C' },
            { label: 'Reserve', percentage: 25, color: '#2D6A4F' },
            { label: 'Utilities', percentage: 20, color: '#E8A838' },
            { label: 'Insurance', percentage: 15, color: '#E86A5E' },
          ]
        },
        activeProposals: (await db.select().from(proposals)
          .where(and(eq(proposals.neighborhoodId, user.neighborhoodId), gte(proposals.votingEndsAt, Date.now())))
          .all()).map((p: any) => ({
            id: p.id,
            title: p.title,
            type: p.type,
            status: p.status,
            quorumRequired: p.quorumRequired,
            quorumCurrent: 10 // Mock for now, need to count ballots
          })),
        recentActivity: recentActivity.length > 0 ? recentActivity : [
          { id: 'a-001', type: 'proposal_created', title: 'New proposal: EV Charging Stations', timestamp: '2h ago' },
          { id: 'a-002', type: 'vote_passed', title: 'Vote passed: Landscaping Budget', timestamp: 'Yesterday' },
        ]
      }
    });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

export { dashboard };
