import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number | ReactNode
  accentColor: string
  linkTo?: string
}

export default function MetricCard({ icon: Icon, label, value, accentColor, linkTo }: MetricCardProps) {
  const content = (
    <div
      className="card-metric cursor-pointer transition-all hover:shadow-card-hover group"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>
      <span className="text-h2 font-bold" style={{ color: 'var(--color-text-heading)' }}>
        {value}
      </span>
      <span className="text-small text-text-muted">{label}</span>
    </div>
  )

  if (linkTo) {
    return <a href={linkTo}>{content}</a>
  }
  return content
}