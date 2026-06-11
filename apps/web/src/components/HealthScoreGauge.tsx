interface HealthScoreGaugeProps {
  score: number
  level: 'green' | 'amber' | 'red'
  size?: number
}

const levelColors = {
  green: { base: '#38A169', track: '#E8F5EE', text: '#1A5A3A', label: 'Fully Compliant' },
  amber: { base: '#D69E2E', track: '#FEF3D6', text: '#92400E', label: 'Minor Issues' },
  red: { base: '#E53E3E', track: '#FDE8E5', text: '#9B1C1C', label: 'Statutory Risk' },
}

export default function HealthScoreGauge({ score, level, size = 200 }: HealthScoreGaugeProps) {
  const config = levelColors[level]
  const radius = 80
  const circumference = Math.PI * radius // Half circle
  const offset = circumference - (score / 100) * circumference
  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        {/* Background arc */}
        <path
          d={describeArc(center, center - 10, radius, 180, 0)}
          fill="none"
          stroke="var(--color-border-light)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={describeArc(center, center - 10, radius, 180, 0)}
          fill="none"
          stroke={config.base}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
          style={{
            filter: `drop-shadow(0 0 4px ${config.base}40)`,
          }}
        />
        {/* Score text */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-4xl font-bold"
          fill="var(--color-text-heading)"
          fontSize="36"
          fontWeight="800"
          fontFamily="'Inter', sans-serif"
        >
          {score}
        </text>
        <text
          x={center}
          y={center + 24}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fontFamily="'Inter', sans-serif"
          fill="var(--color-text-muted)"
        >
          out of 100
        </text>
      </svg>
      <div
        className="px-3 py-1 rounded-full text-xs font-bold"
        style={{ backgroundColor: config.track, color: config.text }}
      >
        {config.label}
      </div>
    </div>
  )
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 180) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 0 ${end.x} ${end.y}`
}