import type { 
  DashboardData, 
  Proposal, 
  VoteResult, 
  LedgerData,
  HealthScore, 
  SentinelAlert, 
  ComplianceReport, 
  RecordRequest, 
  PublicTransparency 
} from './types'

const API_BASE = '/api/v1'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`)
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.data as T
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error?.message || 'Request failed')
  }
  const json = await res.json()
  return json.data as T
}

export const api = {
  getDashboard: () => fetchJson<DashboardData>('/dashboard'),
  getProposals: () => fetchJson<Proposal[]>('/proposals'),
  getProposal: (id: string) => fetchJson<Proposal>(`/proposals/${id}`),
  getActivity: () => fetchJson('/activity'),
  getMaintenance: () => fetchJson('/maintenance'),
  getFinancials: () => fetchJson<LedgerData>('/financials'),
  getCommunityPulse: () => fetchJson('/community-pulse'),
  getNeighborhood: () => fetchJson('/neighborhood'),
  getMe: () => fetchJson('/me'),
  castVote: async (proposalId: string, option: string, userId: string): Promise<VoteResult> => {
    const res = await fetch(`${API_BASE}/proposals/${proposalId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option, userId }),
    })
    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error?.message || 'Vote failed')
    }
    const json = await res.json()
    return json.data as VoteResult
  },
  // ── Compliance Endpoints ──
  getHealthScore: () => fetchJson<HealthScore>('/compliance/health-score'),
  getSentinelAlerts: () => fetchJson<SentinelAlert[]>('/compliance/sentinel-alerts'),
  getReports: () => fetchJson<ComplianceReport[]>('/compliance/reports'),
  generateReport: (type: 'annual_financial' | 'meeting_minutes') => 
    postJson<ComplianceReport>('/compliance/reports/generate', { type }),
  getRecordRequests: () => fetchJson<RecordRequest[]>('/compliance/records'),
  submitRecordRequest: (data: { residentName: string; documentType: string; properPurpose: string }) =>
    postJson<RecordRequest>('/compliance/records', data),
  fulfillRecordRequest: (id: string, action: 'fulfill' | 'deny', adminNotes?: string) =>
    postJson<RecordRequest>(`/compliance/records/${id}/fulfill`, { action, adminNotes }),
  getPublicTransparency: () => fetchJson<PublicTransparency>('/compliance/public'),
}
