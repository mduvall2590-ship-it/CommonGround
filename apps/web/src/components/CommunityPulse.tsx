import { Users, Zap } from 'lucide-react'

interface CommunityPulseProps {
  activeCount: number
  totalCount: number
  votesLast24h: number
}

export default function CommunityPulse({ activeCount, totalCount, votesLast24h }: CommunityPulseProps) {
  // Generate a grid of dots
  const cols = 9
  const rows = 4
  const totalDots = cols * rows
  const activeDots = Math.min(activeCount, totalDots)

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-heading flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          Community Pulse
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalDots }).map((_, i) => {
          const isActive = i < activeDots
          const isGlowing = i < Math.min(votesLast24h, activeDots)
          return (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                isGlowing
                  ? 'animate-pulse-glow'
                  : ''
              }`}
              style={{
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                animationDelay: `${(i % 5) * 400}ms`,
              }}
            />
          )
        })}
      </div>
      <div className="flex items-center gap-4 text-tiny text-text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--color-primary)' }} />
          {activeCount} neighbors active
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
          {votesLast24h} votes in 24h
        </span>
      </div>
    </div>
  )
}