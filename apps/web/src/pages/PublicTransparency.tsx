import { Shield, CheckCircle2, TrendingDown, Lightbulb, Home, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import HealthScoreGauge from '../components/HealthScoreGauge'

export default function PublicTransparency() {
  const { data: publicData, isLoading } = useQuery({
    queryKey: ['public-transparency'],
    queryFn: api.getPublicTransparency,
  })

  if (isLoading || !publicData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-48 mx-auto" />
          <div className="skeleton h-32 w-64 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg width="40" height="40" viewBox="0 0 32 32">
              <polygon points="16,2 30,12 30,30 2,30 2,12" fill="#0D7C8C" opacity="0.9"/>
              <polygon points="16,6 26,14 26,26 6,26 6,14" fill="#F5F0EB" opacity="0.9"/>
              <rect x="13" y="17" width="6" height="9" fill="#0D7C8C" rx="1"/>
            </svg>
            <span className="text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>CommonGround</span>
          </div>
          <h1 className="text-h1 text-text-heading" style={{ fontFamily: 'var(--font-serif)' }}>
            {publicData.neighborhoodName}
          </h1>
          <p className="text-body text-text-muted mt-2">
            Transparency Report — Building trust through openness.
          </p>
        </div>

        {/* Transparency Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary-light text-brand-primary text-sm font-semibold border border-brand-primary/20">
            <Shield className="w-4 h-4" />
            CommonGround Transparency Pledge Active
          </div>
        </div>

        {/* Score & Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="card flex flex-col items-center py-6">
            <HealthScoreGauge score={publicData.complianceScore} level={publicData.complianceLevel} size={180} />
            <p className="text-tiny text-text-muted mt-2 text-center">Compliance Health Score</p>
          </div>
          <div className="card space-y-4 py-6">
            <h3 className="text-sm font-semibold text-text-heading text-center">Community at a Glance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="flex items-center gap-2 text-small text-text-muted">
                  <TrendingDown className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                  Dues Reduction
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                  {publicData.duesReduction}%
                </span>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="flex items-center gap-2 text-small text-text-muted">
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  Reserve Funded
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
                  {publicData.reserveHealth}%
                </span>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="flex items-center gap-2 text-small text-text-muted">
                  <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  Improvements Completed
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  {publicData.improvementsCompleted}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charter */}
        <div className="card card-dark space-y-3 mb-8">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="font-semibold text-sm">The CommonGround Transparency Pledge</span>
          </div>
          <div className="card-dark-sub">
            <p className="text-sm text-white/90 leading-relaxed">
              {publicData.charterCommitment}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-small text-text-muted mb-4">
            This community is managed by its residents via CommonGround — the resident-owned governance platform.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 btn-primary"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}