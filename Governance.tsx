import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Vote, Plus } from 'lucide-react'
import { api } from '../api'
import { ProposalTypeBadge, StatusBadge } from '../components/Badge'
import ProgressBar from '../components/ProgressBar'

export default function Governance() {
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: api.getProposals,
  })

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-32 rounded-lg" />
        <div className="skeleton h-32 rounded-lg" />
        <div className="skeleton h-32 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2" style={{ color: 'var(--color-text-heading)' }}>
            <Vote className="w-6 h-6 inline mr-2" style={{ color: 'var(--color-primary)' }} />
            Governance
          </h1>
          <p className="text-small text-text-muted mt-1">Community proposals and votes</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          New Proposal
        </button>
      </div>

      <div className="space-y-3">
        {proposals && proposals.length > 0 ? (
          proposals.map((prop) => (
            <Link
              key={prop.id}
              to={`/governance/${prop.id}`}
              className="card block hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ProposalTypeBadge type={prop.type} />
                    <StatusBadge status={prop.status} />
                  </div>
                  <h3 className="text-h3 text-text-heading mb-1">{prop.title}</h3>
                  <p className="text-small text-text-muted line-clamp-2 mb-3">{prop.description}</p>
                  <div className="flex items-center gap-4 text-tiny text-text-muted">
                    <span>By {prop.author.name}</span>
                    <span>·</span>
                    <span>{prop.options.length} options</span>
                    {prop.status === 'VOTING' && (
                      <>
                        <span>·</span>
                        <span>Ends {new Date(prop.endDate).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Mini progress indicator */}
                {prop.status === 'VOTING' && (
                  <div className="w-24 shrink-0 ml-4">
                    <ProgressBar
                      value={prop.quorumCurrent}
                      max={prop.quorumRequired}
                      height={6}
                      showCount={false}
                    />
                    <p className="text-tiny text-text-muted text-right mt-1">
                      {Math.round((prop.quorumCurrent / prop.quorumRequired) * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="card text-center py-12">
            <Vote className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
            <h3 className="text-h3 text-text-heading mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              No votes yet — be the first to propose something!
            </h3>
            <p className="text-small text-text-muted mb-4">
              Start a new proposal to get the conversation going.
            </p>
            <button className="btn-primary">
              <Plus className="w-4 h-4" />
              Create a Proposal
            </button>
          </div>
        )}
      </div>
    </div>
  )
}