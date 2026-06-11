interface SentimentPulseProps {
  positive: number
  neutral: number
  negative: number
}

export default function SentimentPulse({ positive, neutral, negative }: SentimentPulseProps) {
  const total = positive + neutral + negative

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-text-heading">Community Sentiment</h4>
      <div className="space-y-1.5">
        <SentimentBar
          emoji="😊"
          label="Positive"
          value={positive}
          total={total}
          color="var(--color-primary)"
        />
        <SentimentBar
          emoji="😐"
          label="Neutral"
          value={neutral}
          total={total}
          color="var(--color-warning)"
        />
        <SentimentBar
          emoji="🙁"
          label="Negative"
          value={negative}
          total={total}
          color="var(--color-energy)"
        />
      </div>
    </div>
  )
}

function SentimentBar({
  emoji,
  label,
  value,
  total,
  color,
}: {
  emoji: string
  label: string
  value: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-5 text-center">{emoji}</span>
      <span className="text-tiny text-text-muted w-12">{label}</span>
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-border-light)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            animation: `grow-width 500ms cubic-bezier(0.16, 1, 0.3, 1) both`,
          }}
        />
      </div>
      <span className="text-tiny font-semibold w-10 text-right" style={{ color: 'var(--color-text-heading)' }}>
        {percentage}%
      </span>
    </div>
  )
}