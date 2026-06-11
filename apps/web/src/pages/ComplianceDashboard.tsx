import { Shield, CheckCircle2, AlertTriangle, ExternalLink, Scale, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import HealthScoreGauge from '../components/HealthScoreGauge'
import SentinelAlerts from '../components/SentinelAlerts'
import ReportGenerator from '../components/ReportGenerator'
import { RecordRequestForm, RecordRequestList } from '../components/RecordAccess'

export default function ComplianceDashboard() {
  const { data: healthScore, isLoading: scoreLoading } = useQuery({
    queryKey: ['health-score'],
    queryFn: api.getHealthScore,
  })

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
  })

  if (scoreLoading) {
    return <ComplianceSkeleton />
  }

  const neighborhoodName = dashboard?.neighborhood.name || 'Your Community'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h2" style={{ color: 'var(--color-text-heading)' }}>
          <Shield className="w-6 h-6 inline mr-2" style={{ color: 'var(--color-primary)' }} />
          Regulatory Transparency
        </h1>
        <p className="text-small text-text-muted mt-1">
          Continuous compliance monitoring for {neighborhoodName} under Tennessee law — because trust is built, not assumed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="md:col-span-7 space-y-4">
          {/* Health Score + Metrics */}
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-text-heading">Compliance Health Score</h3>
            {healthScore && (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <HealthScoreGauge score={healthScore.score} level={healthScore.level} />
                <div className="flex-1 w-full space-y-3">
                  {healthScore.metrics.map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <div className="flex items-center justify-between text-small">
                        <div className="flex items-center gap-1.5">
                          {metric.status === 'compliant' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                          ) : metric.status === 'warning' ? (
                            <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--color-error)' }} />
                          )}
                          <span className="font-semibold text-text-heading">{metric.label}</span>
                        </div>
                        <span className="text-text-muted">{metric.weight}% weight</span>
                      </div>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${metric.percentage}%`,
                            backgroundColor: metric.status === 'compliant'
                              ? 'var(--color-success)'
                              : metric.status === 'warning'
                              ? 'var(--color-warning)'
                              : 'var(--color-error)',
                          }}
                        />
                      </div>
                      <p className="text-tiny text-text-muted">{metric.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Government-Ready Reports */}
          <ReportGenerator />

          {/* TN Compliance Checklist */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span className="font-semibold text-sm text-text-heading">TN AI Auditor Checklist</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Annual Financial Statement Deadline', status: 'pass', detail: 'Provided within 120 days after FY end (T.C.A. § 48-66-201)' },
                { label: 'Meeting Notice Window', status: 'pass', detail: 'Notice sent 10–60 days before member meetings' },
                { label: 'Director Conflicts of Interest', status: 'pass', detail: 'No payments to Board-owned entities flagged (T.C.A. § 48-58-701)' },
                { label: 'Record Retention', status: 'pass', detail: 'All minutes, accounting records, and membership lists archived' },
                { label: 'Nonprofit Status & Filing', status: 'warn', detail: 'Annual report filed with TN Secretary of State. Next due: December 2025' },
                { label: 'Management Certificate', status: 'pass', detail: 'On file with Wilson County Register of Deeds' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-2.5 rounded-md border border-brand-border-light">
                  {item.status === 'pass' ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-success)' }} />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-warning)' }} />
                  )}
                  <div>
                    <span className="text-small font-medium text-text-heading">{item.label}</span>
                    <p className="text-tiny text-text-muted">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-5 space-y-4">
          {/* Sentinel Alerts */}
          <SentinelAlerts />

          {/* Record Access */}
          <RecordRequestForm />
          <RecordRequestList />

          {/* Transparency Charter */}
          <div className="card card-dark space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold text-sm">Transparency Charter</span>
            </div>
            <div className="card-dark-sub">
              <p className="text-sm text-white/90 leading-relaxed">
                "The Board of Directors of <strong>{neighborhoodName}</strong> hereby adopts the CommonGround Transparency Charter. We commit to:
              </p>
              <ol className="text-sm text-white/80 mt-2 space-y-1 list-decimal list-inside">
                <li><strong>Real-Time Access</strong> — Live dashboard of finances and vendor contracts.</li>
                <li><strong>AI Verification</strong> — Every dollar accounted for and TN-compliant.</li>
                <li><strong>Inclusive Voting</strong> — Digital voting for all major community decisions.</li>
                <li><strong>Resident-Led Governance</strong> — Minimizing overhead to maximize community investment.</li>
              </ol>
            </div>
          </div>

          {/* Public Transparency Page Toggle */}
          <div className="card space-y-3" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-heading flex items-center gap-2">
                <ExternalLink className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                Public Transparency Page
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-brand-border-light rounded-full peer peer-checked:bg-brand-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
            <p className="text-tiny text-text-muted">
              Toggle ON to share your community's compliance health, reserve fund status, and improvement achievements publicly. 
              No private resident data is ever shown.
            </p>
            {healthScore && (
              <div className="flex items-center gap-4 text-tiny">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" style={{ color: 'var(--color-success)' }} />
                  Score: {healthScore.score}/100
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--color-success)' }} />
                  78% Reserve Funded
                </span>
              </div>
            )}
            <a
              href="/transparency"
              className="inline-flex items-center gap-1.5 text-tiny font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Public Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComplianceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="skeleton h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div className="skeleton h-64 rounded-lg" />
          <div className="skeleton h-48 rounded-lg" />
          <div className="skeleton h-56 rounded-lg" />
        </div>
        <div className="md:col-span-5 space-y-4">
          <div className="skeleton h-40 rounded-lg" />
          <div className="skeleton h-32 rounded-lg" />
          <div className="skeleton h-48 rounded-lg" />
          <div className="skeleton h-40 rounded-lg" />
        </div>
      </div>
    </div>
  )
}