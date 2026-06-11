interface ProgressBarProps {
  value: number
  max: number
  color?: string
  label?: string
  showCount?: boolean
  height?: number
}

export default function ProgressBar({
  value,
  max,
  color,
  label,
  showCount = true,
  height = 8,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const isQuorumReached = value >= max
  const barColor = color || (isQuorumReached ? 'var(--color-success)' : 'var(--color-primary)')

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between text-small">
          <span className="font-semibold text-text-heading">{label}</span>
          {showCount && (
            <span className="text-text-muted">
              {value} of {max} votes needed
              {percentage > 0 && <span className="ml-1">({Math.round(percentage)}%)</span>}
            </span>
          )}
        </div>
      )}
      <div className="progress-bar" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
      {isQuorumReached && (
        <p className="text-tiny font-semibold" style={{ color: 'var(--color-success)' }}>
          Quorum reached! 🎉
        </p>
      )}
    </div>
  )
}