import { createDb } from './index';
import { neighborhoods, expenses, users, properties, proposals, neighborhoodConfigs, rules } from './schema';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seed() {
  const db = createDb('file:local.db');
  
  console.log('Seeding database...');
  
  const neighborhoodIds = {
    oakwood: '550e8400-e29b-41d4-a716-446655440000',
    pine: '67c3c574-bd5d-4f10-9177-38038753e164'
  };

  await db.insert(neighborhoods).values([
    {
      id: neighborhoodIds.oakwood,
      name: 'Oakwood Estates',
      location: 'Sunnyvale, CA',
      createdAt: Date.now(),
    },
    {
      id: neighborhoodIds.pine,
      name: 'Pine Valley',
      location: 'Austin, TX',
      createdAt: Date.now(),
    }
  ]).onConflictDoNothing();

  await db.insert(neighborhoodConfigs).values([
    {
      neighborhoodId: neighborhoodIds.oakwood,
      defaultQuorum: 20,
      defaultThreshold: 51,
      defaultVotingPeriodDays: 7,
      expenseThresholdCents: 50000,
    },
    {
      neighborhoodId: neighborhoodIds.pine,
      defaultQuorum: 25,
      defaultThreshold: 67,
      defaultVotingPeriodDays: 14,
      expenseThresholdCents: 100000,
    }
  ]).onConflictDoNothing();

  const passwordHash = await bcrypt.hash('password123', 10);

  const userIds = {
    admin: uuidv4(),
    resident1: uuidv4(),
    resident2: uuidv4(),
  };

  await db.insert(users).values([
    {
      id: userIds.admin,
      email: 'admin@oakwood.com',
      passwordHash,
      name: 'Alice Admin',
      neighborhoodId: neighborhoodIds.oakwood,
      role: 'ADMIN',
      createdAt: Date.now(),
    },
    {
      id: userIds.resident1,
      email: 'bob@oakwood.com',
      passwordHash,
      name: 'Bob Resident',
      neighborhoodId: neighborhoodIds.oakwood,
      role: 'RESIDENT',
      createdAt: Date.now(),
    },
    {
      id: userIds.resident2,
      email: 'charlie@oakwood.com',
      passwordHash,
      name: 'Charlie Resident',
      neighborhoodId: neighborhoodIds.oakwood,
      role: 'RESIDENT',
      createdAt: Date.now(),
    }
  ]).onConflictDoNothing();

  const propertyIds = {
    p1: uuidv4(),
    p2: uuidv4(),
    p3: uuidv4(),
  };

  await db.insert(properties).values([
    {
      id: propertyIds.p1,
      neighborhoodId: neighborhoodIds.oakwood,
      address: '123 Oak St',
      ownerId: userIds.admin,
      createdAt: Date.now(),
    },
    {
      id: propertyIds.p2,
      neighborhoodId: neighborhoodIds.oakwood,
      address: '124 Oak St',
      ownerId: userIds.resident1,
      createdAt: Date.now(),
    },
    {
      id: propertyIds.p3,
      neighborhoodId: neighborhoodIds.oakwood,
      address: '125 Oak St',
      ownerId: userIds.resident2,
      createdAt: Date.now(),
    }
  ]).onConflictDoNothing();

  await db.insert(expenses).values([
    {
      id: uuidv4(),
      neighborhoodId: neighborhoodIds.oakwood,
      amount: 125000, // $1,250.00
      description: 'Pool maintenance and chemical treatment',
      category: 'Maintenance',
      createdAt: Date.now(),
    },
    {
      id: uuidv4(),
      neighborhoodId: neighborhoodIds.oakwood,
      amount: 45000, // $450.00
      description: 'Entrance landscaping and seasonal flowers',
      category: 'Landscaping',
      createdAt: Date.now(),
    },
    {
      id: uuidv4(),
      neighborhoodId: neighborhoodIds.pine,
      amount: 80000, // $800.00
      description: 'Street light repair and bulb replacement',
      category: 'Repair',
      createdAt: Date.now(),
    }
  ]).onConflictDoNothing();

  const proposalIds = {
    prop1: uuidv4(),
    prop2: uuidv4(),
  };

  await db.insert(proposals).values([
    {
      id: proposalIds.prop1,
      neighborhoodId: neighborhoodIds.oakwood,
      proposerId: userIds.admin,
      title: 'Update Pool Hours',
      description: 'We propose extending the pool hours until 10 PM during the summer months.',
      type: 'OPERATIONAL',
      rationale: 'Many residents have requested later hours for evening swims.',
      options: JSON.stringify(['Yes', 'No']),
      status: 'VOTING',
      quorumRequired: 10,
      thresholdRequired: 51,
      votingEndsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      createdAt: Date.now(),
    },
    {
      id: proposalIds.prop2,
      neighborhoodId: neighborhoodIds.oakwood,
      proposerId: userIds.resident1,
      title: 'Install Speed Bumps on Oak St',
      description: 'Proposal to install 3 speed bumps on Oak St to improve safety.',
      type: 'GOVERNANCE',
      rationale: 'Cars are often speeding through this residential street, posing a risk to children and pets.',
      options: JSON.stringify(['Approve', 'Reject', 'Need more info']),
      status: 'DISCUSSION',
      quorumRequired: 20,
      thresholdRequired: 67,
      discussionEndsAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
      votingEndsAt: Date.now() + 10 * 24 * 60 * 60 * 1000,
      createdAt: Date.now(),
    }
  ]).onConflictDoNothing();

  await db.insert(rules).values([
    {
      id: uuidv4(),
      neighborhoodId: neighborhoodIds.oakwood,
      title: 'Noise Ordinance',
      content: 'Quiet hours are from 10 PM to 8 AM daily.',
      version: 1,
      createdAt: Date.now(),
    },
    {
      id: uuidv4(),
      neighborhoodId: neighborhoodIds.oakwood,
      title: 'Pet Policy',
      content: 'All pets must be leashed in common areas. Maximum of 2 pets per household.',
      version: 1,
      createdAt: Date.now(),
    }
  ]).onConflictDoNothing();
  
  console.log('Seeding complete.');
}

seed().catch(console.error);
