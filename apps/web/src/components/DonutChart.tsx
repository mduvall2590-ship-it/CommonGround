import type { FinancialCategory } from '../types'

interface DonutChartProps {
  categories: FinancialCategory[]
  totalLabel: string
}

export default function DonutChart({ categories, totalLabel }: DonutChartProps) {
  const total = categories.reduce((sum, c) => sum + c.percentage, 0)
  let cumulativeAngle = 0

  // Build segments
  const segments = categories.map((cat) => {
    const angle = (cat.percentage / total) * 360
    const startAngle = cumulativeAngle
    cumulativeAngle += angle
    return { ...cat, startAngle, angle }
  })

  return (
    <div className="flex items-center gap-6">
      {/* Simple donut using SVG */}
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const startRad = (seg.startAngle * Math.PI) / 180
            const endRad = ((seg.startAngle + seg.angle) * Math.PI) / 180
            const x1 = 50 + 38 * Math.cos(startRad)
            const y1 = 50 + 38 * Math.sin(startRad)
            const x2 = 50 + 38 * Math.cos(endRad)
            const y2 = 50 + 38 * Math.sin(endRad)
            const largeArc = seg.angle > 180 ? 1 : 0

            return (
              <path
                key={i}
                d={`M 50 50 L ${x1} ${y1} A 38 38 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={seg.color}
                opacity="0.9"
              />
            )
          })}
          {/* Center hole */}
          <circle cx="50" cy="50" r="22" fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-h2 font-bold" style={{ color: 'var(--color-text-heading)' }}>
            ${totalLabel}
          </span>
          <span className="text-tiny text-text-muted">/month</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-small text-text-muted">{cat.label}</span>
            <span className="text-small font-semibold" style={{ color: 'var(--color-text-heading)' }}>
              {cat.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}