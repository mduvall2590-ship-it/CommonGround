import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const neighborhoods = sqliteTable('neighborhoods', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location'),
  createdAt: integer('created_at').notNull(),
});

export const neighborhoodConfigs = sqliteTable('neighborhood_configs', {
  neighborhoodId: text('neighborhood_id').primaryKey().references(() => neighborhoods.id),
  defaultQuorum: integer('default_quorum').notNull().default(20), // percentage
  defaultThreshold: integer('default_threshold').notNull().default(51), // percentage
  defaultVotingPeriodDays: integer('default_voting_period_days').notNull().default(7),
  expenseThresholdCents: integer('expense_threshold_cents').notNull().default(50000), // $500
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  neighborhoodId: text('neighborhood_id').references(() => neighborhoods.id),
  role: text('role').notNull(), // 'RESIDENT', 'ADMIN'
  createdAt: integer('created_at').notNull(),
});

export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  neighborhoodId: text('neighborhood_id').notNull().references(() => neighborhoods.id),
  address: text('address').notNull(),
  ownerId: text('owner_id').references(() => users.id),
  createdAt: integer('created_at').notNull(),
});

export const dues = sqliteTable('dues', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull().references(() => properties.id),
  amount: integer('amount').notNull(), // in cents
  status: text('status').notNull(), // 'PENDING', 'PAID', 'OVERDUE'
  dueDate: integer('due_date').notNull(),
  paidAt: integer('paid_at'),
});

export const maintenanceRequests = sqliteTable('maintenance_requests', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull().references(() => properties.id),
  requesterId: text('requester_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'), // #Landscaping, #Plumbing, etc.
  status: text('status').notNull(), // 'SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'
  priority: text('priority').notNull(), // 'LOW', 'MEDIUM', 'HIGH'
  vendorId: text('vendor_id').references((): any => vendors.id),
  rating: integer('rating'), // Resident feedback 1-5
  feedback: text('feedback'), // Resident comments
  createdAt: integer('created_at').notNull(),
});

export const vendors = sqliteTable('vendors', {
  id: text('id').primaryKey(),
  neighborhoodId: text('neighborhood_id').notNull().references(() => neighborhoods.id),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'Plumbing', 'Electrical', etc.
  contactInfo: text('contact_info'),
  rating: integer('rating'), // Average rating 1-5
  createdAt: integer('created_at').notNull(),
});

export const quotes = sqliteTable('quotes', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull().references(() => maintenanceRequests.id),
  vendorId: text('vendor_id').notNull().references(() => vendors.id),
  amountCents: integer('amount_cents').notNull(),
  estimatedStartDate: integer('estimated_start_date'),
  estimatedEndDate: integer('estimated_end_date'),
  notes: text('notes'),
  status: text('status').notNull(), // 'PENDING', 'ACCEPTED', 'REJECTED'
  createdAt: integer('created_at').notNull(),
});

export const proposals = sqliteTable('proposals', {
  id: text('id').primaryKey(),
  neighborhoodId: text('neighborhood_id').notNull().references(() => neighborhoods.id),
  proposerId: text('proposer_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // 'GOVERNANCE', 'FINANCIAL', 'OPERATIONAL', 'EMERGENCY'
  rationale: text('rationale'),
  options: text('options').notNull(), // JSON array of strings
  status: text('status').notNull(), // 'DISCUSSION', 'VOTING', 'PASSED', 'REJECTED', 'CANCELLED'
  quorumRequired: integer('quorum_required').notNull(),
  thresholdRequired: integer('threshold_required').notNull(),
  discussionEndsAt: integer('discussion_ends_at'),
  votingEndsAt: integer('voting_ends_at').notNull(),
  collectiveBoardWeight: integer('collective_board_weight').notNull().default(0),
  metadata: text('metadata'), // JSON for structured data (e.g., budget items)
  createdAt: integer('created_at').notNull(),
});

export const ballots = sqliteTable('ballots', {
  id: text('id').primaryKey(),
  proposalId: text('proposal_id').notNull().references(() => proposals.id),
  userId: text('user_id').notNull().references(() => users.id),
  propertyId: text('property_id').notNull().references(() => properties.id),
  selection: text('selection').notNull(),
  isBoardVote: integer('is_board_vote', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
});

export const rules = sqliteTable('rules', {
  id: text('id').primaryKey(),
  neighborhoodId: text('neighborhood_id').notNull().references(() => neighborhoods.id),
  proposalId: text('proposal_id').references(() => proposals.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  version: integer('version').notNull().default(1),
  parentRuleId: text('parent_rule_id').references((): any => rules.id),
  createdAt: integer('created_at').notNull(),
});

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  neighborhoodId: text('neighborhood_id').notNull().references(() => neighborhoods.id),
  year: integer('year').notNull(),
  category: text('category').notNull(), // e.g., 'Landscaping', 'Legal', 'Pool'
  amountCents: integer('amount_cents').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  neighborhoodId: text('neighborhood_id').notNull().references(() => neighborhoods.id),
  proposalId: text('proposal_id').references(() => proposals.id), // Link to approving vote if > threshold
  amount: integer('amount').notNull(), // in cents
  description: text('description').notNull(),
  category: text('category').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const auditLog = sqliteTable('audit_trail', {
  id: text('id').primaryKey(),
  neighborhoodId: text('neighborhood_id').notNull().references(() => neighborhoods.id),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at').notNull(),
});

export const improvementIdeas = sqliteTable('improvement_ideas', {
  id: text('id').primaryKey(),
  neighborhoodId: text('neighborhood_id').notNull().references(() => neighborhoods.id),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(), // 'DRAFT', 'ACTIVE', 'PROPOSED', 'ARCHIVED'
  upvotesCount: integer('upvotes_count').notNull().default(0),
  proposalId: text('proposal_id').references(() => proposals.id), // Link to proposal if converted
  createdAt: integer('created_at').notNull(),
});

export const improvementUpvotes = sqliteTable('improvement_upvotes', {
  id: text('id').primaryKey(),
  ideaId: text('idea_id').notNull().references(() => improvementIdeas.id),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at').notNull(),
});

export const aiSummaries = sqliteTable('ai_summaries', {
  id: text('id').primaryKey(),
  proposalId: text('proposal_id').notNull().references(() => proposals.id).unique(),
  summaryText: text('summary_text').notNull(),
  sentimentScore: integer('sentiment_score'), // normalized -100 to 100
  keyPointsJson: text('key_points_json'), // JSON array of for/against
  updatedAt: integer('updated_at').notNull(),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  expenseId: text('expense_id').notNull().references(() => expenses.id),
  status: text('status').notNull(), // 'VERIFIED', 'FLAGGED'
  authorizationSourceType: text('authorization_source_type'), // 'BUDGET', 'PROPOSAL', 'EMERGENCY'
  authorizationSourceId: text('authorization_source_id'),
  reasoning: text('reasoning'),
  confidenceScore: integer('confidence_score'),
  createdAt: integer('created_at').notNull(),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  proposalId: text('proposal_id').notNull().references(() => proposals.id),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(),
});
