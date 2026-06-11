import { Shield, AlertCircle } from 'lucide-react'

interface BoardRecommendationProps {
  recommendation?: string
  breakdown?: Record<string, number>
}

export default function BoardRecommendation({ recommendation, breakdown }: BoardRecommendationProps) {
  if (!recommendation) {
    return (
      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <span className="font-semibold text-sm text-text-heading">Board Recommendation</span>
        </div>
        <p className="text-small text-text-muted italic">No consensus yet — board members are still deliberating.</p>
      </div>
    )
  }

  return (
    <div className="card space-y-3" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4" style={{ color: 'var(--color-secondary)' }} />
        <span className="font-semibold text-sm text-text-heading">Board Recommendation</span>
      </div>
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>
          🛡️ Recommended: {recommendation}
        </span>
      </div>
      <p className="text-small text-text-muted">
        The board has reached a majority consensus and recommends approval. This adds +20% weight to the {recommendation} option.
      </p>
      {breakdown && (
        <div className="pt-2 border-t border-brand-border-light">
          <span className="text-tiny font-semibold text-text-muted">Board Vote Breakdown:</span>
          <div className="flex gap-4 mt-1.5">
            {Object.entries(breakdown).map(([option, count]) => (
              <div key={option} className="flex items-center gap-1">
                <span className="text-tiny font-semibold text-text-heading">{option}:</span>
                <span className="text-tiny text-text-muted">{count} board member{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}