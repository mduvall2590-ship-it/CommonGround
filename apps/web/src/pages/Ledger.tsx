import { DollarSign, Receipt, Shield, ArrowUpRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import DonutChart from '../components/DonutChart'

export default function Ledger() {
  const { data: financials, isLoading } = useQuery({
    queryKey: ['financials'],
    queryFn: api.getFinancials,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2" style={{ color: 'var(--color-text-heading)' }}>
          <DollarSign className="w-6 h-6 inline mr-2" style={{ color: 'var(--color-primary)' }} />
          Community Ledger
        </h1>
        <p className="text-small text-text-muted mt-1">
          "Glass House" — every dollar, every decision, fully transparent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Left: Financial Overview */}
        <div className="md:col-span-7 space-y-4">
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-text-heading">Financial Overview</h3>
            {financials && (
              <DonutChart categories={financials.categories} totalLabel={String(financials.totalDues)} />
            )}
          </div>

          {/* Recent Transactions */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-text-heading">Recent Transactions</h3>
            <div className="space-y-2">
              {[
                { description: 'Pool Maintenance — Chemical Treatment', amount: '$340.00', date: '2 days ago', verified: true },
                { description: 'Landscaping — Monthly Service', amount: '$2,000.00', date: '5 days ago', verified: true },
                { description: 'Electric Bill — Common Areas', amount: '$850.00', date: '1 week ago', verified: true },
                { description: 'Insurance Premium — Q3 Payment', amount: '$1,275.00', date: '2 weeks ago', verified: true },
                { description: 'Gate Repair — Parts & Labor', amount: '$520.00', date: '2 weeks ago', verified: false },
              ].map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-md border border-brand-border-light hover:shadow-card-hover transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-small font-medium text-text-heading truncate">{tx.description}</p>
                      {tx.verified ? (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          style={{ background: '#E8F5EE', color: '#1A5A3A' }}
                        >
                          <Shield className="w-3 h-3" />
                          AI-Verified
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          style={{ background: '#FDE8E5', color: '#9B1C1C' }}
                        >
                          Anomaly
                        </span>
                      )}
                    </div>
                    <p className="text-tiny text-text-muted">{tx.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-text-heading ml-4">{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="md:col-span-5 space-y-4">
          {/* Community Wealth */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-text-heading flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
              Community Wealth
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-small text-text-muted">Total Balance</span>
                <span className="text-h3 font-bold" style={{ color: 'var(--color-text-heading)' }}>$48,250</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-small text-text-muted">Dues Collection Rate</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-small text-text-muted">Reserve Fund</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>$24,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-small text-text-muted">Money Saved vs Mgmt</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>+$4,200/yr</span>
              </div>
            </div>
          </div>

          {/* Dues Status (Resident-specific) */}
          <div className="card space-y-3" style={{ borderLeft: '4px solid var(--color-success)' }}>
            <h3 className="text-sm font-semibold text-text-heading">My Balance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-h3 font-bold" style={{ color: 'var(--color-success)' }}>Paid ✓</p>
                <p className="text-tiny text-text-muted">Current period: July 2025</p>
              </div>
              <Receipt className="w-8 h-8" style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="pt-2 border-t border-brand-border-light">
              <p className="text-tiny text-text-muted">Next due: August 1, 2025</p>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="card card-dark space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="font-semibold text-sm">AI AUDITOR</span>
            </div>
            <div className="card-dark-sub">
              <p className="text-tiny text-white/80">Last Audit: Today, 2:30 PM</p>
              <p className="text-sm text-white/90 mt-1">
                All expenditures cross-referenced against approved budgets. No anomalies detected.
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-tiny text-white/70">
                  <span>Verified transactions</span>
                  <span className="text-white font-semibold">42</span>
                </div>
                <div className="flex justify-between text-tiny text-white/70">
                  <span>Flagged for review</span>
                  <span className="text-white font-semibold">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}