import { useState } from 'react'
import { FileText, Download, CheckCircle2, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import type { ComplianceReport } from '../types'
import { StatusBadge } from './Badge'

export default function ReportGenerator() {
  const queryClient = useQueryClient()
  const [generating, setGenerating] = useState<'annual_financial' | 'meeting_minutes' | null>(null)

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: api.getReports,
  })

  const generateMutation = useMutation({
    mutationFn: (type: 'annual_financial' | 'meeting_minutes') => api.generateReport(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setGenerating(null)
    },
    onError: () => setGenerating(null),
  })

  const handleGenerate = (type: 'annual_financial' | 'meeting_minutes') => {
    setGenerating(type)
    generateMutation.mutate(type)
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
        <span className="font-semibold text-sm text-text-heading">Government-Ready Reporting</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => handleGenerate('annual_financial')}
          disabled={generating !== null}
          className="p-4 rounded-md border-2 border-dashed border-brand-border-light hover:border-brand-primary/50 hover:bg-brand-primary-light/30 transition-all text-left"
        >
          {generating === 'annual_financial' ? (
            <Loader2 className="w-5 h-5 animate-spin mb-2" style={{ color: 'var(--color-primary)' }} />
          ) : (
            <Download className="w-5 h-5 mb-2" style={{ color: 'var(--color-primary)' }} />
          )}
          <p className="text-sm font-semibold text-text-heading">Annual Financial Report</p>
          <p className="text-tiny text-text-muted mt-0.5">Income/Expense, Balance Sheet, Reserve Fund</p>
        </button>
        <button
          onClick={() => handleGenerate('meeting_minutes')}
          disabled={generating !== null}
          className="p-4 rounded-md border-2 border-dashed border-brand-border-light hover:border-brand-primary/50 hover:bg-brand-primary-light/30 transition-all text-left"
        >
          {generating === 'meeting_minutes' ? (
            <Loader2 className="w-5 h-5 animate-spin mb-2" style={{ color: 'var(--color-primary)' }} />
          ) : (
            <Download className="w-5 h-5 mb-2" style={{ color: 'var(--color-primary)' }} />
          )}
          <p className="text-sm font-semibold text-text-heading">Meeting Minutes</p>
          <p className="text-tiny text-text-muted mt-0.5">Attendance log + AI-summarized minutes</p>
        </button>
      </div>

      {/* Report history */}
      {reports && reports.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-brand-border-light">
          <span className="text-tiny font-semibold text-text-muted">Generated Reports</span>
          {reports.slice(0, 5).map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-2.5 rounded-md border border-brand-border-light hover:bg-brand-surface/50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-small text-text-heading truncate">{report.title}</span>
                {report.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-success)' }} />
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-tiny text-text-muted">{report.format}</span>
                <span className="text-tiny text-text-muted">{new Date(report.generatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}