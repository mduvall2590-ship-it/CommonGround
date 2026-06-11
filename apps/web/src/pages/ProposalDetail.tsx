import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { api } from '../api'
import { ProposalTypeBadge, StatusBadge } from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import SentimentPulse from '../components/SentimentPulse'
import AIFacilitator from '../components/AIFacilitator'
import BoardRecommendation from '../components/BoardRecommendation'
import VotingInterface from '../components/VotingInterface'
import type { VoteResult } from '../types'

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>()
  const [quorumSnapshot, setQuorumSnapshot] = useState<{ current: number; votes: { option: string; count: number }[] } | null>(null)

  const { data: proposal, isLoading, error } = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => api.getProposal(id!),
    enabled: !!id,
  })

  const handleVoteSuccess = (result: VoteResult) => {
    setQuorumSnapshot({
      current: result.quorumCurrent,
      votes: result.votes,
    })
  }

  if (isLoading) {
    return <ProposalDetailSkeleton />
  }

  if (error || !proposal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-body text-text-muted">Couldn't load this proposal</p>
        <Link to="/governance" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Go back
        </Link>
      </div>
    )
  }

  const effectiveQuorumCurrent = quorumSnapshot?.current ?? proposal.quorumCurrent
  const effectiveVotes = quorumSnapshot?.votes ?? proposal.votes
  const totalVotesCast = effectiveVotes.reduce((sum, v) => sum + v.count, 0)

  return (
    <div className="space-y-4">
      {/* Back link */}
      <Link
        to="/governance"
        className="inline-flex items-center gap-1.5 text-small font-medium text-text-muted hover:text-text-heading transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Proposals
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column - Main Content */}
        <div className="md:col-span-7 space-y-4">
          {/* Proposal Header Card */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={proposal.status} />
              <ProposalTypeBadge type={proposal.type} />
            </div>

            <div>
              <h1 className="text-h2" style={{ color: 'var(--color-text-heading)' }}>
                {proposal.title}
              </h1>
              <p className="text-body text-text-muted mt-2">{proposal.description}</p>
            </div>

            <div className="flex items-center gap-4 text-tiny text-text-muted border-t border-brand-border-light pt-3">
              <span>By {proposal.author.name}</span>
              <span>·</span>
              <span>Created {new Date(proposal.createdAt).toLocaleDateString()}</span>
              {proposal.status === 'VOTING' && (
                <>
                  <span>·</span>
                  <span>Ends {new Date(proposal.endDate).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>

          {/* Quorum Progress */}
          <div className="card">
            <ProgressBar
              label="Quorum Progress"
              value={effectiveQuorumCurrent}
              max={proposal.quorumRequired}
            />
          </div>

          {/* Voting */}
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-text-heading">Cast Your Vote</h3>
            <VotingInterface
              proposalId={proposal.id}
              options={proposal.options}
              endDate={proposal.endDate}
              status={proposal.status}
              onVoteSuccess={handleVoteSuccess}
            />
          </div>

          {/* Sentiment Pulse */}
          {proposal.status !== 'DISCUSSION' && (
            <div className="card">
              <SentimentPulse
                positive={proposal.sentiment.positive}
                neutral={proposal.sentiment.neutral}
                negative={proposal.sentiment.negative}
              />
            </div>
          )}

          {/* Board Recommendation */}
          <BoardRecommendation
            recommendation={proposal.boardRecommendation?.recommendation}
            breakdown={proposal.boardRecommendation?.breakdown}
          />

          {/* Community Discussion */}
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-text-heading flex items-center gap-2">
              <MessageSquare className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              Community Discussion
            </h3>

            {/* Sample comments */}
            <div className="space-y-3">
              <div className="p-3 rounded-md border border-brand-border-light">
                <div className="flex items-center justify-between text-tiny text-text-muted mb-1">
                  <span className="font-semibold text-text-heading">Alex M.</span>
                  <span>2h ago</span>
                </div>
                <p className="text-small">I think this is a great idea! The cost seems reasonable given the long-term benefits.</p>
              </div>
              <div className="p-3 rounded-md border border-brand-border-light">
                <div className="flex items-center justify-between text-tiny text-text-muted mb-1">
                  <span className="font-semibold text-text-heading">Jamie L.</span>
                  <span>5h ago</span>
                </div>
                <p className="text-small">Has anyone checked if our electrical panel can support this? We should get a quote from an electrician first.</p>
              </div>
            </div>

            {/* Comment input */}
            <div className="flex items-center gap-2 pt-2 border-t border-brand-border-light">
              <input
                type="text"
                placeholder="Add your thoughts about this proposal..."
                className="flex-1 px-4 py-2.5 rounded-lg text-small border border-brand-border-light bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                disabled={proposal.status !== 'VOTING' && proposal.status !== 'DISCUSSION'}
              />
              <button className="btn-primary shrink-0 px-4 py-2.5" disabled={proposal.status !== 'VOTING' && proposal.status !== 'DISCUSSION'}>
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="md:col-span-5 space-y-4">
          <AIFacilitator proposal={proposal} />

          {/* Vote Results Summary */}
          <div className="card space-y-3">
            <h4 className="text-sm font-semibold text-text-heading">Current Results</h4>
            <div className="space-y-2">
              {effectiveVotes.map((vote) => {
                const pct = totalVotesCast > 0 ? Math.round((vote.count / totalVotesCast) * 100) : 0
                const colors: Record<string, string> = {
                  'Yes': 'var(--color-primary)',
                  'No': 'var(--color-energy)',
                  'Abstain': 'var(--color-text-muted)',
                }
                return (
                  <div key={vote.option} className="space-y-1">
                    <div className="flex items-center justify-between text-small">
                      <span className="font-medium text-text-heading">{vote.option}</span>
                      <span className="text-text-muted">{vote.count} votes ({pct}%)</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${pct}%`, backgroundColor: colors[vote.option] || 'var(--color-primary)' }}
                      />
                    </div>
                  </div>
                )
              })}
              {totalVotesCast === 0 && (
                <p className="text-small text-text-muted italic">No votes cast yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProposalDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="skeleton h-4 w-24" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div className="skeleton h-48 rounded-lg" />
          <div className="skeleton h-24 rounded-lg" />
          <div className="skeleton h-48 rounded-lg" />
          <div className="skeleton h-32 rounded-lg" />
          <div className="skeleton h-24 rounded-lg" />
          <div className="skeleton h-40 rounded-lg" />
        </div>
        <div className="md:col-span-5 space-y-4">
          <div className="skeleton h-64 rounded-lg" />
          <div className="skeleton h-40 rounded-lg" />
        </div>
      </div>
    </div>
  )
}