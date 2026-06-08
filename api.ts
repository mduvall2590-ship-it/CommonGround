import type { DashboardData, Proposal, VoteResult } from './types'

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

export const api = {
  getDashboard: () => fetchJson<DashboardData>('/dashboard'),
  getProposals: () => fetchJson<Proposal[]>('/proposals'),
  getProposal: (id: string) => fetchJson<Proposal>(`/proposals/${id}`),
  getActivity: () => fetchJson('/activity'),
  getMaintenance: () => fetchJson('/maintenance'),
  getFinancials: () => fetchJson('/financials'),
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
}