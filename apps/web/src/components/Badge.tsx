import { ReactNode } from 'react'

interface BadgeProps {
  variant: 'voting' | 'passed' | 'rejected' | 'discussion' | 'pending'
  icon?: ReactNode
  children: ReactNode
}

const variantClasses: Record<string, string> = {
  voting: 'badge-voting',
  passed: 'badge-passed',
  rejected: 'badge-rejected',
  discussion: 'badge-discussion',
  pending: 'badge-pending',
}

const variantLabels: Record<string, string> = {
  voting: 'VOTING ACTIVE',
  passed: 'PASSED',
  rejected: 'REJECTED',
  discussion: 'DISCUSSION',
  pending: 'PENDING',
}

export default function Badge({ variant, icon, children }: BadgeProps) {
  return (
    <span className={`badge ${variantClasses[variant] || ''}`}>
      {icon}
      {children}
    </span>
  )
}

export function ProposalTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    FINANCIAL: { label: 'FINANCIAL', bg: '#E6F4F6', color: '#0A6A78' },
    BUDGET: { label: 'BUDGET', bg: '#E8F5EE', color: '#1A5A3A' },
    OPERATIONAL: { label: 'OPERATIONAL', bg: '#FEF3D6', color: '#92400E' },
    GOVERNANCE: { label: 'GOVERNANCE', bg: '#FDE8E5', color: '#9B1C1C' },
  }
  const c = config[type] || config.FINANCIAL
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  const variant = (['voting', 'passed', 'rejected', 'discussion', 'pending'].includes(s) 
    ? s 
    : 'pending') as 'voting' | 'passed' | 'rejected' | 'discussion' | 'pending';
  
  return (
    <Badge variant={variant}>
      {variantLabels[s] || status}
    </Badge>
  )
}
