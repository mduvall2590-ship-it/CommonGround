import { Hono } from 'hono';
import { db } from '../db';
import { proposals, ballots, users, properties, rules, auditLog, neighborhoodConfigs, budgets, dues, comments } from 'db';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { ProposalSchema, BallotSchema } from 'types';
import { zValidator } from '@hono/zod-validator';
import { jwt } from 'hono/jwt';
import { JWT_SECRET } from './auth';

const governance = new Hono();

// All governance routes require authentication
governance.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));

// List all proposals for a neighborhood
governance.get('/proposals', async (c) => {
  const neighborhoodId = c.req.query('neighborhoodId');
  if (!neighborhoodId) {
    return c.json({ error: { message: 'neighborhoodId is required' } }, 400);
  }

  try {
    const allProposals = await db.select()
      .from(proposals)
      .where(eq(proposals.neighborhoodId, neighborhoodId))
      .orderBy(desc(proposals.createdAt))
      .all();

    const neighborhoodProperties = await db.select()
      .from(properties)
      .where(eq(properties.neighborhoodId, neighborhoodId))
      .all();
    
    const totalProperties = neighborhoodProperties.length;

    // Enhance proposals with vote counts
    const enhancedProposals = await Promise.all(allProposals.map(async (p: any) => {
      const voteCount = await db.select()
        .from(ballots)
        .where(eq(ballots.proposalId, p.id))
        .all();
      
      return {
        ...p,
        totalVotes: voteCount.length,
        totalProperties,
        options: JSON.parse(p.options)
      };
    }));

    return c.json({ data: enhancedProposals });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Get proposal detail including current vote counts, quorum, and board weighting
governance.get('/proposals/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const proposal = await db.select().from(proposals).where(eq(proposals.id, id)).get();
    if (!proposal) {
      return c.json({ error: { message: 'Proposal not found' } }, 404);
    }

    const neighborhoodBallots = await db.select().from(ballots).where(eq(ballots.proposalId, id)).all();
    const neighborhoodProperties = await db.select()
      .from(properties)
      .where(eq(properties.neighborhoodId, proposal.neighborhoodId))
      .all();
    
    const boardMembers = await db.select()
      .from(users)
      .where(and(eq(users.neighborhoodId, proposal.neighborhoodId), eq(users.role, 'ADMIN')))
      .all();

    const totalProperties = neighborhoodProperties.length;
    const totalBoardMembers = boardMembers.length;

    // Calculate results
    const results: Record<string, number> = {};
    const boardResults: Record<string, number> = {};
    const options = JSON.parse(proposal.options) as string[];
    options.forEach(opt => {
      results[opt] = 0;
      boardResults[opt] = 0;
    });

    neighborhoodBallots.forEach((ballot: any) => {
      const currentVal = results[ballot.selection];
      if (currentVal !== undefined) {
        results[ballot.selection] = currentVal + 1;
      }
      const currentBoardVal = boardResults[ballot.selection];
      if (ballot.isBoardVote && currentBoardVal !== undefined) {
        boardResults[ballot.selection] = currentBoardVal + 1;
      }
    });

    // Handle Collective Board Weight
    let boardRecommendation = null;
    if (totalBoardMembers > 0) {
      for (const opt of options) {
        const br = boardResults[opt];
        if (br !== undefined && br > totalBoardMembers / 2) {
          const res = results[opt];
          if (res !== undefined) {
            results[opt] = res + proposal.collectiveBoardWeight;
          }
          boardRecommendation = opt;
          break;
        }
      }
    }

    // Quorum and Threshold calculations
    const quorumReached = (neighborhoodBallots.length / totalProperties) * 100 >= proposal.quorumRequired;
    
    // Find the winner if any
    let winner = null;
    let maxVotes = 0;
    const totalWeight = Object.values(results).reduce((a: number, b: number) => a + b, 0);

    for (const opt of options) {
      const res = results[opt];
      if (res !== undefined && res > maxVotes) {
        maxVotes = res;
        winner = opt;
      }
    }

    const winnerVotes = winner ? (results[winner] ?? 0) : 0;
    const thresholdMet = winner && totalWeight > 0 ? (winnerVotes / totalWeight) * 100 >= proposal.thresholdRequired : false;

    // Map results to the format expected by the frontend
    const votes = options.map(opt => ({
      option: opt,
      count: results[opt] || 0
    }));

    // Auto-transition status if voting has ended
    let currentStatus = proposal.status;
    if (proposal.status === 'VOTING' && Date.now() > proposal.votingEndsAt) {
      currentStatus = (quorumReached && thresholdMet) ? 'PASSED' : 'REJECTED';
    } else if (proposal.status === 'DISCUSSION' && proposal.discussionEndsAt && Date.now() > proposal.discussionEndsAt) {
      currentStatus = 'VOTING';
    }

    return c.json({ 
      data: { 
        ...proposal, 
        status: currentStatus,
        results,
        boardResults,
        boardRecommendation: boardRecommendation ? {
          recommendation: boardRecommendation,
          breakdown: boardResults
        } : undefined,
        votes,
        sentiment: { positive: 60, neutral: 25, negative: 15 }, // Mock sentiment for now
        aiSummary: proposal.description.substring(0, 100) + '...', // Simple summary
        aiInsight: quorumReached ? 'Quorum reached. Community sentiment is positive.' : 'More votes needed to reach quorum.',
        totalVotes: neighborhoodBallots.length,
        quorumCurrent: neighborhoodBallots.length,
        quorumRequired: Math.ceil((totalProperties * proposal.quorumRequired) / 100),
        totalProperties,
        quorumReached,
        thresholdMet,
        options,
        endDate: proposal.votingEndsAt
      } 
    });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Create a new proposal
governance.post('/proposals', zValidator('json', ProposalSchema.omit({ id: true, createdAt: true, status: true })), async (c) => {
  const payload = c.get('jwtPayload') as any;
  const userId = payload.id;
  const input = c.req.valid('json');

  try {
    // Fetch neighborhood config for defaults
    const config = await db.select().from(neighborhoodConfigs).where(eq(neighborhoodConfigs.neighborhoodId, input.neighborhoodId)).get();
    
    const quorumRequired = input.quorumRequired ?? config?.defaultQuorum ?? 10;
    const thresholdRequired = input.thresholdRequired ?? config?.defaultThreshold ?? 51;
    const votingPeriodDays = config?.defaultVotingPeriodDays ?? 7;
    const votingEndsAt = input.votingEndsAt ?? (Date.now() + (votingPeriodDays * 24 * 60 * 60 * 1000));
    const collectiveBoardWeight = input.collectiveBoardWeight ?? 5; // Default weight

    const newProposal = {
      id: uuidv4(),
      ...input,
      options: JSON.stringify(input.options),
      status: 'DISCUSSION' as const,
      quorumRequired,
      thresholdRequired,
      votingEndsAt,
      collectiveBoardWeight,
      createdAt: Date.now(),
    };

    await db.insert(proposals).values(newProposal).run();

    // Log action
    await db.insert(auditLog).values({
      id: uuidv4(),
      neighborhoodId: input.neighborhoodId,
      userId,
      action: 'CREATE_PROPOSAL',
      entityType: 'PROPOSAL',
      entityId: newProposal.id,
      createdAt: Date.now(),
    }).run();

    return c.json({ data: newProposal });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Cast a vote
governance.post('/proposals/:id/vote', async (c) => {
  const proposalId = c.req.param('id');
  const payload = c.get('jwtPayload') as any;
  const userId = payload.id;
  const { selection } = await c.req.json();

  try {
    const proposal = await db.select().from(proposals).where(eq(proposals.id, proposalId)).get();
    if (!proposal) return c.json({ error: { message: 'Proposal not found' } }, 404);
    if (proposal.status !== 'VOTING') {
      return c.json({ error: { message: 'Voting is not active for this proposal' } }, 400);
    }
    if (Date.now() > proposal.votingEndsAt) {
      return c.json({ error: { message: 'Voting period has ended' } }, 400);
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user || !user.neighborhoodId) return c.json({ error: { message: 'User not found or not in a neighborhood' } }, 403);

    // Find the property owned by this user in this neighborhood
    const property = await db.select()
      .from(properties)
      .where(and(eq(properties.ownerId, userId), eq(properties.neighborhoodId, user.neighborhoodId)))
      .get();
    
    if (!property) {
      return c.json({ error: { message: 'Only property owners can vote' } }, 403);
    }

    // Check if a vote has already been cast for this property
    const existingBallot = await db.select()
      .from(ballots)
      .where(and(eq(ballots.proposalId, proposalId), eq(ballots.propertyId, property.id)))
      .get();

    if (existingBallot) {
      return c.json({ error: { message: 'A vote has already been cast for this property' } }, 400);
    }

    const isBoardVote = user.role === 'ADMIN';

    const newBallot = {
      id: uuidv4(),
      proposalId,
      userId,
      propertyId: property.id,
      selection,
      isBoardVote,
      createdAt: Date.now(),
    };

    await db.insert(ballots).values(newBallot).run();

    // Log vote
    await db.insert(auditLog).values({
      id: uuidv4(),
      neighborhoodId: user.neighborhoodId,
      userId,
      action: 'CAST_VOTE',
      entityType: 'PROPOSAL',
      entityId: proposalId,
      metadata: JSON.stringify({ selection, propertyId: property.id }),
      createdAt: Date.now(),
    }).run();

    return c.json({ data: newBallot });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Finalize a proposal after voting ends
governance.post('/proposals/:id/finalize', async (c) => {
  const id = c.req.param('id');
  const payload = c.get('jwtPayload') as any;
  const userId = payload.id;

  try {
    const proposal = await db.select().from(proposals).where(eq(proposals.id, id)).get();
    if (!proposal) return c.json({ error: { message: 'Proposal not found' } }, 404);
    
    if (proposal.status !== 'VOTING') {
      return c.json({ error: { message: 'Proposal is not in VOTING status' } }, 400);
    }

    if (Date.now() <= proposal.votingEndsAt) {
      return c.json({ error: { message: 'Voting period has not ended yet' } }, 400);
    }

    // Re-calculate results to be sure
    const neighborhoodBallots = await db.select().from(ballots).where(eq(ballots.proposalId, id)).all();
    const neighborhoodProperties = await db.select()
      .from(properties)
      .where(eq(properties.neighborhoodId, proposal.neighborhoodId))
      .all();
    
    const boardMembers = await db.select()
      .from(users)
      .where(and(eq(users.neighborhoodId, proposal.neighborhoodId), eq(users.role, 'ADMIN')))
      .all();

    const results: Record<string, number> = {};
    const boardResults: Record<string, number> = {};
    const options = JSON.parse(proposal.options) as string[];
    options.forEach(opt => {
      results[opt] = 0;
      boardResults[opt] = 0;
    });

    neighborhoodBallots.forEach((ballot: any) => {
      const currentVal = results[ballot.selection];
      if (currentVal !== undefined) {
        results[ballot.selection] = currentVal + 1;
      }
      const currentBoardVal = boardResults[ballot.selection];
      if (ballot.isBoardVote && currentBoardVal !== undefined) {
        boardResults[ballot.selection] = currentBoardVal + 1;
      }
    });

    if (boardMembers.length > 0) {
      for (const opt of options) {
        const br = boardResults[opt];
        if (br !== undefined && br > boardMembers.length / 2) {
          const res = results[opt];
          if (res !== undefined) {
            results[opt] = res + proposal.collectiveBoardWeight;
          }
          break;
        }
      }
    }

    const quorumReached = (neighborhoodBallots.length / neighborhoodProperties.length) * 100 >= proposal.quorumRequired;
    
    let winner = null;
    let maxVotes = 0;
    const totalWeight = Object.values(results).reduce((a: number, b: number) => a + b, 0);
    for (const opt of options) {
      const res = results[opt];
      if (res !== undefined && res > maxVotes) {
        maxVotes = res;
        winner = opt;
      }
    }

    const winnerVotes = winner ? (results[winner] ?? 0) : 0;
    const thresholdMet = winner && totalWeight > 0 ? (winnerVotes / totalWeight) * 100 >= proposal.thresholdRequired : false;

    const finalStatus = (quorumReached && thresholdMet) ? 'PASSED' : 'REJECTED';

    await db.update(proposals)
      .set({ status: finalStatus })
      .where(eq(proposals.id, id))
      .run();

    // If passed and is GOVERNANCE, create/update rule
    if (finalStatus === 'PASSED') {
      if (proposal.type === 'GOVERNANCE') {
        const newRule = {
          id: uuidv4(),
          neighborhoodId: proposal.neighborhoodId,
          proposalId: proposal.id,
          title: proposal.title,
          content: proposal.description,
          version: 1,
          createdAt: Date.now(),
        };
        await db.insert(rules).values(newRule).run();
      } else if (proposal.type === 'BUDGET' && proposal.metadata) {
        // Handle Budget and Dues Generation
        const budgetData = JSON.parse(proposal.metadata);
        const year = budgetData.year || new Date().getFullYear();
        const categories = budgetData.categories || []; // { category: string, amountCents: number }
        
        let totalBudgetCents = 0;
        for (const cat of categories) {
          await db.insert(budgets).values({
            id: uuidv4(),
            neighborhoodId: proposal.neighborhoodId,
            year,
            category: cat.category,
            amountCents: cat.amountCents,
            createdAt: Date.now()
          }).run();
          totalBudgetCents += cat.amountCents;
        }

        // Generate Dues for all properties
        const props = await db.select().from(properties).where(eq(properties.neighborhoodId, proposal.neighborhoodId)).all();
        if (props.length > 0) {
          const amountPerProperty = Math.ceil(totalBudgetCents / props.length);
          for (const prop of props) {
            await db.insert(dues).values({
              id: uuidv4(),
              propertyId: prop.id,
              amount: amountPerProperty,
              status: 'PENDING',
              dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
            }).run();
          }
        }
      }
    }

    // Log finalization
    await db.insert(auditLog).values({
      id: uuidv4(),
      neighborhoodId: proposal.neighborhoodId,
      userId,
      action: 'FINALIZE_PROPOSAL',
      entityType: 'PROPOSAL',
      entityId: id,
      metadata: JSON.stringify({ finalStatus, winner, quorumReached, thresholdMet }),
      createdAt: Date.now(),
    }).run();

    return c.json({ data: { id, status: finalStatus } });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Update/Cancel proposal
governance.patch('/proposals/:id', async (c) => {
  const id = c.req.param('id');
  const payload = c.get('jwtPayload') as any;
  const userId = payload.id;
  const { status, title, description } = await c.req.json();

  try {
    const proposal = await db.select().from(proposals).where(eq(proposals.id, id)).get();
    if (!proposal) return c.json({ error: { message: 'Proposal not found' } }, 404);

    // Only proposer or admin can cancel/update
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (proposal.proposerId !== userId && user?.role !== 'ADMIN') {
      return c.json({ error: { message: 'Unauthorized' } }, 403);
    }

    const updates: Partial<any> = {};
    if (status) updates.status = status;
    if (title) updates.title = title;
    if (description) updates.description = description;

    await db.update(proposals)
      .set(updates)
      .where(eq(proposals.id, id))
      .run();

    // Log update
    await db.insert(auditLog).values({
      id: uuidv4(),
      neighborhoodId: proposal.neighborhoodId,
      userId,
      action: 'UPDATE_PROPOSAL',
      entityType: 'PROPOSAL',
      entityId: id,
      metadata: JSON.stringify(updates),
      createdAt: Date.now(),
    }).run();

    return c.json({ data: { ...proposal, ...updates } });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Get rule history
governance.get('/rules/:id/history', async (c) => {
  const id = c.req.param('id');
  try {
    const rule = await db.select().from(rules).where(eq(rules.id, id)).get();
    if (!rule) return c.json({ error: { message: 'Rule not found' } }, 404);

    const history = [];
    let current: any = rule;
    history.push(current);

    while (current.parentRuleId) {
      current = await db.select().from(rules).where(eq(rules.id, current.parentRuleId)).get();
      if (!current) break;
      history.push(current);
    }

    return c.json({ data: history });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// List rules (Bylaws)
governance.get('/rules', async (c) => {
  const neighborhoodId = c.req.query('neighborhoodId');
  if (!neighborhoodId) return c.json({ error: { message: 'neighborhoodId is required' } }, 400);

  try {
    const activeRules = await db.select()
      .from(rules)
      .where(eq(rules.neighborhoodId, neighborhoodId))
      .all();
    return c.json({ data: activeRules });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Add a comment to a proposal
governance.post('/proposals/:id/comments', async (c) => {
  const proposalId = c.req.param('id');
  const payload = c.get('jwtPayload') as any;
  const userId = payload.id;
  const { content } = await c.req.json();

  if (!content) return c.json({ error: { message: 'Content is required' } }, 400);

  try {
    const newComment = {
      id: uuidv4(),
      proposalId,
      userId,
      content,
      createdAt: Date.now(),
    };

    await db.insert(comments).values(newComment).run();

    return c.json({ data: newComment });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

// Get comments for a proposal
governance.get('/proposals/:id/comments', async (c) => {
  const proposalId = c.req.param('id');

  try {
    const allComments = await db.select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      userName: users.name
    })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.proposalId, proposalId))
      .orderBy(desc(comments.createdAt))
      .all();

    return c.json({ data: allComments });
  } catch (error) {
    return c.json({ error: { message: (error as Error).message } }, 500);
  }
});

export { governance };
