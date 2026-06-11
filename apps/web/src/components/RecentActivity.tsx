import { FileText, CheckCircle2, Wrench, Receipt } from 'lucide-react'
import type { ActivityItem } from '../types'

const activityConfig: Record<string, { icon: typeof FileText; bg: string; color: string }> = {
  proposal_created: { icon: FileText, bg: '#E6F4F6', color: '#0D7C8C' },
  vote_passed: { icon: CheckCircle2, bg: '#E8F5EE', color: '#2D6A4F' },
  maintenance_resolved: { icon: Wrench, bg: '#FEF3D6', color: '#E8A838' },
  expense_recorded: { icon: Receipt, bg: '#FDE8E5', color: '#E86A5E' },
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="card space-y-3">
      <h3 className="text-sm font-semibold text-text-heading">Recent Activity</h3>
      <div className="space-y-2">
        {items.map((item, i) => {
          const config = activityConfig[item.type] || activityConfig.proposal_created
          const Icon = config.icon
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-2 rounded-md hover:bg-brand-surface/50 transition-colors animate-slide-in-right"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: config.bg }}
              >
                <Icon className="w-4 h-4" style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-small text-text-heading truncate">{item.title}</p>
                <p className="text-tiny text-text-muted">{item.timestamp}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}