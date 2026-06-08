export interface User {
  id: string
  name: string
  email: string
  role: 'RESIDENT' | 'ADMIN'
  neighborhoodId: string
  avatar?: string
}

export interface Neighborhood {
  id: string
  name: string
  location: string
  memberCount: number
  totalDues: number
  duesPeriod: string
}

export interface DashboardMetrics {
  activeVotes: number
  openRepairs: number
  duesPaid: boolean
}

export interface CommunityPulse {
  activeCount: number
  totalCount: number
  votesLast24h: number
}

export interface FinancialCategory {
  label: string
  percentage: number
  color: string
}

export interface FinancialSnapshot {
  totalDues: number
  period: string
  categories: FinancialCategory[]
}

export interface ActiveProposal {
  id: string
  title: string
  type: 'FINANCIAL' | 'BUDGET' | 'OPERATIONAL' | 'GOVERNANCE'
  status: 'DISCUSSION' | 'VOTING' | 'PASSED' | 'REJECTED'
  quorumRequired: number
  quorumCurrent: number
}

export interface ActivityItem {
  id: string
  type: 'proposal_created' | 'vote_passed' | 'maintenance_resolved' | 'expense_recorded'
  title: string
  timestamp: string
}

export interface DashboardData {
  user: User
  neighborhood: Neighborhood
  metrics: DashboardMetrics
  communityPulse: CommunityPulse
  financialSnapshot: FinancialSnapshot
  activeProposals: ActiveProposal[]
  recentActivity: ActivityItem[]
}

export interface Proposal {
  id: string
  neighborhoodId: string
  title: string
  description: string
  type: 'FINANCIAL' | 'BUDGET' | 'OPERATIONAL' | 'GOVERNANCE'
  status: 'DISCUSSION' | 'VOTING' | 'PASSED' | 'REJECTED'
  options: string[]
  endDate: number
  createdAt: number
  author: { id: string; name: string }
  quorumRequired: number
  quorumCurrent: number
  votes: { option: string; count: number }[]
  sentiment: { positive: number; neutral: number; negative: number }
  aiSummary: string
  aiInsight: string
  boardRecommendation?: { recommendation: string; breakdown: Record<string, number> }
}

export interface VoteResult {
  success: boolean
  message: string
  quorumCurrent: number
  votes: { option: string; count: number }[]
}