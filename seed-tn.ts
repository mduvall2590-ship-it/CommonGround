import { createDb } from './index';
import { 
  neighborhoods, neighborhoodConfigs, users, properties, 
  dues, maintenanceRequests, vendors, proposals, 
  budgets, expenses, auditLogs, comments 
} from './schema';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seed() {
  const db = createDb('file:local.db');
  
  console.log('Seeding Tennessee Sample Neighborhood...');
  
  const neighborhoodId = 'tn-alpha-001';
  const now = Date.now();

  // 1. Neighborhood & Config
  await db.insert(neighborhoods).values({
    id: neighborhoodId,
    name: 'Music City Commons',
    location: 'Nashville, TN',
    createdAt: now,
  }).onConflictDoNothing();

  await db.insert(neighborhoodConfigs).values({
    neighborhoodId: neighborhoodId,
    defaultQuorum: 20,
    defaultThreshold: 51,
    defaultVotingPeriodDays: 7,
    expenseThresholdCents: 50000, // $500
  }).onConflictDoNothing();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Residents (including Board Members)
  const boardIds = {
    president: uuidv4(),
    treasurer: uuidv4(),
  };
  const residentIds = Array.from({ length: 13 }, () => uuidv4());

  const allUsers = [
    { id: boardIds.president, email: 'president@musiccity.com', name: 'Johnny Cash', role: 'ADMIN' },
    { id: boardIds.treasurer, email: 'treasurer@musiccity.com', name: 'Dolly Parton', role: 'ADMIN' },
    ...residentIds.map((id, i) => ({
      id,
      email: `resident${i+1}@musiccity.com`,
      name: `Resident ${i+1}`,
      role: 'RESIDENT'
    }))
  ];

  await db.insert(users).values(allUsers.map(u => ({
    ...u,
    passwordHash,
    neighborhoodId,
    createdAt: now,
  }))).onConflictDoNothing();

  // 3. Properties (25 units)
  const propIds = Array.from({ length: 25 }, () => uuidv4());
  const propertyValues = propIds.map((id, i) => ({
    id,
    neighborhoodId,
    address: `${100 + i} Guitar String Ln, Nashville, TN 37203`,
    ownerId: i < allUsers.length ? allUsers[i].id : null,
    createdAt: now,
  }));

  await db.insert(properties).values(propertyValues).onConflictDoNothing();

  // 4. Financials (Budgets & Expenses)
  const budgetId = uuidv4();
  await db.insert(budgets).values([
    { id: uuidv4(), neighborhoodId, year: 2024, category: 'Landscaping', amountCents: 500000, createdAt: now },
    { id: uuidv4(), neighborhoodId, year: 2024, category: 'Utilities', amountCents: 300000, createdAt: now },
    { id: uuidv4(), neighborhoodId, year: 2024, category: 'Maintenance', amountCents: 400000, createdAt: now },
  ]);

  const proposalIdVerified = uuidv4();
  // Approved proposal for verified expense
  await db.insert(proposals).values({
    id: proposalIdVerified,
    neighborhoodId,
    proposerId: boardIds.president,
    title: 'New Community Fence',
    description: 'Replace the aging fence on the north boundary.',
    type: 'FINANCIAL',
    options: JSON.stringify(['APPROVE', 'REJECT']),
    status: 'PASSED',
    quorumRequired: 20,
    thresholdRequired: 51,
    votingEndsAt: now - 10000,
    createdAt: now - 86400000 * 30,
  });

  const expensesData = [
    { id: uuidv4(), neighborhoodId, amount: 120000, description: 'Quarterly Lawn Care', category: 'Landscaping', createdAt: now - 86400000 * 5, proposalId: null },
    { id: uuidv4(), neighborhoodId, amount: 45000, description: 'Monthly Pool Cleaning', category: 'Maintenance', createdAt: now - 86400000 * 2, proposalId: null },
    { id: uuidv4(), neighborhoodId, amount: 250000, description: 'Fence Installation - Part 1', category: 'Maintenance', createdAt: now - 86400000 * 1, proposalId: proposalIdVerified },
    { id: uuidv4(), neighborhoodId, amount: 80000, description: 'Unplanned Pipe Leak Repair', category: 'Maintenance', createdAt: now, proposalId: null },
  ];

  for (const exp of expensesData) {
    await db.insert(expenses).values(exp);
    
    // AI Audit Logs
    const isVerified = exp.proposalId !== null || exp.amount < 50000;
    await db.insert(auditLogs).values({
      id: uuidv4(),
      expenseId: exp.id,
      status: isVerified ? 'VERIFIED' : 'FLAGGED',
      authorizationSourceType: exp.proposalId ? 'PROPOSAL' : (exp.amount < 50000 ? 'BUDGET' : null),
      authorizationSourceId: exp.proposalId || null,
      reasoning: isVerified ? 'Expense matched approved source.' : 'Expense exceeds threshold without linked proposal.',
      confidenceScore: 95,
      createdAt: now,
    });
  }

  // 5. Active Proposals
  await db.insert(proposals).values([
    {
      id: uuidv4(),
      neighborhoodId,
      proposerId: residentIds[0],
      title: 'Solar Street Lights',
      description: 'Install solar-powered lights along Guitar String Ln to reduce utility costs.',
      type: 'OPERATIONAL',
      options: JSON.stringify(['YES', 'NO']),
      status: 'DISCUSSION',
      quorumRequired: 20,
      thresholdRequired: 51,
      votingEndsAt: now + 86400000 * 7,
      createdAt: now - 86400000,
    },
    {
      id: uuidv4(),
      neighborhoodId,
      proposerId: boardIds.treasurer,
      title: '2025 Annual Budget',
      description: 'Proposed budget for the upcoming fiscal year.',
      type: 'BUDGET',
      options: JSON.stringify(['APPROVE', 'REJECT']),
      status: 'VOTING',
      quorumRequired: 25,
      thresholdRequired: 67,
      votingEndsAt: now + 86400000 * 5,
      createdAt: now - 86400000 * 2,
    }
  ]);

  // 6. Maintenance Requests
  await db.insert(maintenanceRequests).values([
    {
      id: uuidv4(),
      propertyId: propIds[5],
      requesterId: residentIds[2],
      title: 'Broken Sprinkler Head',
      description: 'Sprinkler is spraying directly onto the sidewalk.',
      category: 'Landscaping',
      status: 'SUBMITTED',
      priority: 'LOW',
      createdAt: now - 3600000,
    },
    {
      id: uuidv4(),
      propertyId: propIds[10],
      requesterId: residentIds[5],
      title: 'Street Light Out',
      description: 'The light in front of house 110 is flickering and mostly out.',
      category: 'Utilities',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdAt: now - 86400000,
    }
  ]);

  console.log('Tennessee Sample Neighborhood seeding complete.');
}

seed().catch(console.error);
