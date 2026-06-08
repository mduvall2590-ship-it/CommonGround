import { Vote, Wrench, CheckCircle2, CreditCard, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api'
import MetricCard from '../components/MetricCard'
import CommunityPulse from '../components/CommunityPulse'
import DonutChart from '../components/DonutChart'
import ProgressBar from '../components/ProgressBar'
import RecentActivity from '../components/RecentActivity'
import { ProposalTypeBadge, StatusBadge } from '../components/Badge'

function getHourBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-body text-text-muted">Something went wrong loading your dashboard</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  const { user, neighborhood, metrics, communityPulse, financialSnapshot, activeProposals, recentActivity } = data

  return (
    <div className="space-y-6">
      {/* Welcome Greeting */}
      <div>
        <h1 className="text-quote" style={{ color: 'var(--color-text-heading)' }}>
          {getHourBasedGreeting()}, {user.name}! 🏡
        </h1>
        <p className="text-body text-text-muted mt-1">
          Here's what's happening in {neighborhood.name}
        </p>
      </div>

      {/* Metric Hero Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <MetricCard
          icon={Vote}
          label="Active Votes"
          value={metrics.activeVotes}
          accentColor="#E8A838"
        />
        <MetricCard
          icon={Wrench}
          label="Open Repairs"
          value={metrics.openRepairs}
          accentColor="#0D7C8C"
        />
        <MetricCard
          icon={metrics.duesPaid ? CheckCircle2 : CreditCard}
          label="Dues Status"
          value={metrics.duesPaid ? 'Paid ✓' : 'Overdue'}
          accentColor="#2D6A4F"
        />
      </div>

      {/* Community Pulse + Active Proposals Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        <div className="md:col-span-7 space-y-4">
          <CommunityPulse
            activeCount={communityPulse.activeCount}
            totalCount={communityPulse.totalCount}
            votesLast24h={communityPulse.votesLast24h}
          />

          {/* Active Proposals */}
          {activeProposals.length > 0 && (
            <div className="card space-y-3">
              <h3 className="text-sm font-semibold text-text-heading flex items-center gap-2">
                <Vote className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                Active Proposals
              </h3>
              <div className="space-y-3">
                {activeProposals.map((prop) => (
                  <Link
                    key={prop.id}
                    to={`/governance/${prop.id}`}
                    className="block p-3 rounded-md border border-brand-border-light hover:shadow-card-hover transition-all hover:border-brand-primary/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ProposalTypeBadge type={prop.type} />
                      <StatusBadge status={prop.status} />
                    </div>
                    <p className="text-sm font-semibold text-text-heading mb-2">{prop.title}</p>
                    <ProgressBar
                      value={prop.quorumCurrent}
                      max={prop.quorumRequired}
                      height={6}
                      showCount={false}
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-5 space-y-4">
          {/* Financial Snapshot */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-text-heading flex items-center gap-2">
              <CreditCard className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              Financial Snapshot
            </h3>
            <DonutChart
              categories={financialSnapshot.categories}
              totalLabel={String(financialSnapshot.totalDues)}
            />
            <p className="text-tiny text-text-muted italic">
              Your ${financialSnapshot.totalDues}/{financialSnapshot.period} goes{' '}
              {financialSnapshot.categories.map((c, i, arr) => (
                <span key={c.label}>
                  {c.percentage}% to {c.label}
                  {i < arr.length - 1 ? (i === arr.length - 2 ? ', and ' : ', ') : '.'}
                </span>
              ))}
            </p>
          </div>

          {/* Recent Activity */}
          <RecentActivity items={recentActivity} />
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="skeleton h-8 w-72" />
        <div className="skeleton h-4 w-48" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div className="skeleton h-40 rounded-lg" />
          <div className="skeleton h-48 rounded-lg" />
        </div>
        <div className="md:col-span-5 space-y-4">
          <div className="skeleton h-56 rounded-lg" />
          <div className="skeleton h-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}