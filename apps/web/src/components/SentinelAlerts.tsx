import { AlertTriangle, Info, Clock, FileText, Shield } from 'lucide-react'
import type { SentinelAlert } from '../types'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

const alertIcons: Record<string, typeof AlertTriangle> = {
  notice_warning: Clock,
  report_overdue: FileText,
  timer_breach: AlertTriangle,
  certificate_check: Shield,
}

const severityColors: Record<string, { bg: string; color: string }> = {
  high: { bg: '#FDE8E5', color: '#9B1C1C' },
  medium: { bg: '#FEF3D6', color: '#92400E' },
  low: { bg: '#E6F4F6', color: '#0A6A78' },
}

export default function SentinelAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['sentinel-alerts'],
    queryFn: api.getSentinelAlerts,
  })

  if (isLoading) {
    return (
      <div className="card space-y-3">
        <div className="skeleton h-5 w-40" />
        <div className="skeleton h-16 rounded-md" />
        <div className="skeleton h-16 rounded-md" />
      </div>
    )
  }

  if (!alerts || alerts.length === 0) return null

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
        <span className="font-semibold text-sm text-text-heading">AI Sentinel Alerts</span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type] || Info
          const colors = severityColors[alert.severity] || severityColors.low
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-md border border-brand-border-light"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: colors.bg }}
              >
                <Icon className="w-4 h-4" style={{ color: colors.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-heading">{alert.title}</span>
                  {alert.actionable && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: '#FDE8E5', color: '#9B1C1C' }}
                    >
                      ACTION NEEDED
                    </span>
                  )}
                </div>
                <p className="text-small text-text-muted mt-0.5">{alert.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}