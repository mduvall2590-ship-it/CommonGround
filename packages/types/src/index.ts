import { z } from 'zod';

export const NeighborhoodSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  location: z.string().optional(),
  createdAt: z.number(),
});
export type Neighborhood = z.infer<typeof NeighborhoodSchema>;

export const NeighborhoodConfigSchema = z.object({
  neighborhoodId: z.string().uuid(),
  defaultQuorum: z.number().int().min(0).max(100),
  defaultThreshold: z.number().int().min(0).max(100),
  defaultVotingPeriodDays: z.number().int().positive(),
  expenseThresholdCents: z.number().int().positive(),
});
export type NeighborhoodConfig = z.infer<typeof NeighborhoodConfigSchema>;

export const UserRole = z.enum(['RESIDENT', 'ADMIN']);
export type UserRole = z.infer<typeof UserRole>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  neighborhoodId: z.string().uuid().optional(),
  role: UserRole,
  createdAt: z.number(),
});
export type User = z.infer<typeof UserSchema>;

export const PropertySchema = z.object({
  id: z.string().uuid(),
  neighborhoodId: z.string().uuid(),
  address: z.string().min(1),
  ownerId: z.string().uuid().optional(),
  createdAt: z.number(),
});
export type Property = z.infer<typeof PropertySchema>;

export const DueStatus = z.enum(['PENDING', 'PAID', 'OVERDUE']);
export type DueStatus = z.infer<typeof DueStatus>;

export const DueSchema = z.object({
  id: z.string().uuid(),
  propertyId: z.string().uuid(),
  amount: z.number().int().positive(),
  status: DueStatus,
  dueDate: z.number(),
  paidAt: z.number().optional(),
});
export type Due = z.infer<typeof DueSchema>;

export const MaintenanceStatus = z.enum(['SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']);
export type MaintenanceStatus = z.infer<typeof MaintenanceStatus>;

export const MaintenancePriority = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type MaintenancePriority = z.infer<typeof MaintenancePriority>;

export const VendorSchema = z.object({
  id: z.string().uuid(),
  neighborhoodId: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().min(1),
  contactInfo: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  createdAt: z.number(),
});
export type Vendor = z.infer<typeof VendorSchema>;

export const QuoteStatus = z.enum(['PENDING', 'ACCEPTED', 'REJECTED']);
export type QuoteStatus = z.infer<typeof QuoteStatus>;

export const QuoteSchema = z.object({
  id: z.string().uuid(),
  requestId: z.string().uuid(),
  vendorId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  estimatedStartDate: z.number().optional(),
  estimatedEndDate: z.number().optional(),
  notes: z.string().optional(),
  status: QuoteStatus,
  createdAt: z.number(),
});
export type Quote = z.infer<typeof QuoteSchema>;

export const MaintenanceRequestSchema = z.object({
  id: z.string().uuid(),
  propertyId: z.string().uuid(),
  requesterId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  status: MaintenanceStatus,
  priority: MaintenancePriority,
  vendorId: z.string().uuid().optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  createdAt: z.number(),
});
export type MaintenanceRequest = z.infer<typeof MaintenanceRequestSchema>;

export const ProposalType = z.enum(['GOVERNANCE', 'FINANCIAL', 'OPERATIONAL', 'EMERGENCY', 'BUDGET']);
export type ProposalType = z.infer<typeof ProposalType>;

export const ProposalStatus = z.enum(['DISCUSSION', 'VOTING', 'PASSED', 'REJECTED', 'CANCELLED']);
export type ProposalStatus = z.infer<typeof ProposalStatus>;

export const ProposalSchema = z.object({
  id: z.string().uuid(),
  neighborhoodId: z.string().uuid(),
  proposerId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  type: ProposalType,
  rationale: z.string().optional(),
  options: z.array(z.string()),
  status: ProposalStatus,
  quorumRequired: z.number().int().min(0).max(100).optional(),
  thresholdRequired: z.number().int().min(0).max(100).optional(),
  discussionEndsAt: z.number().optional(),
  votingEndsAt: z.number().optional(),
  collectiveBoardWeight: z.number().int().min(0).optional(),
  metadata: z.string().optional(),
  createdAt: z.number(),
  // Extended fields from JOINs/Aggregations
  totalVotes: z.number().int().optional(),
  totalProperties: z.number().int().optional(),
  quorumReached: z.boolean().optional(),
  thresholdMet: z.boolean().optional(),
  proposerName: z.string().optional(),
});
export type Proposal = z.infer<typeof ProposalSchema>;

export const BallotSchema = z.object({
  id: z.string().uuid(),
  proposalId: z.string().uuid(),
  userId: z.string().uuid(),
  propertyId: z.string().uuid(),
  selection: z.string(),
  isBoardVote: z.boolean(),
  createdAt: z.number(),
});
export type Ballot = z.infer<typeof BallotSchema>;

export const RuleSchema = z.object({
  id: z.string().uuid(),
  neighborhoodId: z.string().uuid(),
  proposalId: z.string().uuid().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  version: z.number().int().positive(),
  parentRuleId: z.string().uuid().optional(),
  createdAt: z.number(),
});
export type Rule = z.infer<typeof RuleSchema>;

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  neighborhoodId: z.string().uuid(),
  year: z.number().int(),
  category: z.string().min(1),
  amountCents: z.number().int().positive(),
  createdAt: z.number(),
});
export type Budget = z.infer<typeof BudgetSchema>;

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  neighborhoodId: z.string().uuid(),
  proposalId: z.string().uuid().optional(),
  amount: z.number().int().positive(),
  description: z.string().min(1),
  category: z.string().min(1),
  createdAt: z.number(),
});
export type Expense = z.infer<typeof ExpenseSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: UserRole,
  neighborhoodId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const ImprovementStatus = z.enum(['DRAFT', 'ACTIVE', 'PROPOSED', 'ARCHIVED']);
export type ImprovementStatus = z.infer<typeof ImprovementStatus>;

export const ImprovementIdeaSchema = z.object({
  id: z.string().uuid(),
  neighborhoodId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: ImprovementStatus,
  upvotesCount: z.number().int().min(0),
  proposalId: z.string().uuid().optional(),
  createdAt: z.number(),
});
export type ImprovementIdea = z.infer<typeof ImprovementIdeaSchema>;

export const ImprovementUpvoteSchema = z.object({
  id: z.string().uuid(),
  ideaId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.number(),
});
export type ImprovementUpvote = z.infer<typeof ImprovementUpvoteSchema>;

export const AISummarySchema = z.object({
  id: z.string().uuid(),
  proposalId: z.string().uuid(),
  summaryText: z.string(),
  sentimentScore: z.number().min(-1).max(1).optional(),
  keyPointsJson: z.string().optional(), // Should be a JSON string of array
  updatedAt: z.number(),
});
export type AISummary = z.infer<typeof AISummarySchema>;

export const AuditLogStatus = z.enum(['VERIFIED', 'FLAGGED']);
export type AuditLogStatus = z.infer<typeof AuditLogStatus>;

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  expenseId: z.string().uuid(),
  status: AuditLogStatus,
  authorizationSourceType: z.enum(['BUDGET', 'PROPOSAL', 'EMERGENCY']).optional(),
  authorizationSourceId: z.string().uuid().optional(),
  reasoning: z.string().optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  createdAt: z.number(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const CommentSchema = z.object({
  id: z.string().uuid(),
  proposalId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1),
  createdAt: z.number(),
});
export type Comment = z.infer<typeof CommentSchema>;
