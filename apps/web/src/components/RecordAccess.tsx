import { useState } from 'react'
import { FileText, CheckCircle2, XCircle, Clock, Send, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import type { RecordRequest } from '../types'
import { StatusBadge } from './Badge'

const properPurposeOptions = [
  'To verify Association expenditures and financial health.',
  'To review Board meeting minutes regarding a specific community decision.',
  'To communicate with other members regarding Association affairs (Membership List request).',
  'Other (Please specify)',
]

const requestStatusColors: Record<string, { label: string; variant: 'pending' | 'passed' | 'rejected' }> = {
  pending: { label: 'PENDING', variant: 'pending' },
  fulfilled: { label: 'FULFILLED', variant: 'passed' },
  denied: { label: 'DENIED', variant: 'rejected' },
}

export function RecordRequestForm() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [docType, setDocType] = useState('')
  const [purpose, setPurpose] = useState(properPurposeOptions[0])
  const [customPurpose, setCustomPurpose] = useState('')
  const [showForm, setShowForm] = useState(false)

  const submitMutation = useMutation({
    mutationFn: () => api.submitRecordRequest({
      residentName: name,
      documentType: docType,
      properPurpose: purpose === 'Other (Please specify)' ? customPurpose : purpose,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record-requests'] })
      setName('')
      setDocType('')
      setPurpose(properPurposeOptions[0])
      setCustomPurpose('')
      setShowForm(false)
    },
  })

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="btn-primary w-full"
      >
        <FileText className="w-4 h-4" />
        Request Association Records
      </button>
    )
  }

  return (
    <div className="card space-y-4 border-2 border-brand-primary/30">
      <h3 className="text-sm font-semibold text-text-heading flex items-center gap-2">
        <FileText className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
        New Record Request
      </h3>
      <p className="text-tiny text-text-muted">
        Per <strong>T.C.A. § 48-66-102</strong>, members have the right to inspect Association records. Your request must be made in good faith and for a proper purpose.
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-tiny font-semibold text-text-heading block mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-brand-border-light bg-brand-surface text-small focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="text-tiny font-semibold text-text-heading block mb-1">Document Type</label>
          <input
            type="text"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-brand-border-light bg-brand-surface text-small focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
            placeholder="e.g., Financial Ledger Q1 2025, Board Minutes March 2025"
          />
        </div>
        <div>
          <label className="text-tiny font-semibold text-text-heading block mb-1">
            Proper Purpose <span className="text-text-muted font-normal">(Required by TN Law)</span>
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-brand-border-light bg-brand-surface text-small focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
          >
            {properPurposeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        {purpose === 'Other (Please specify)' && (
          <div>
            <label className="text-tiny font-semibold text-text-heading block mb-1">Specify Purpose</label>
            <textarea
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-brand-border-light bg-brand-surface text-small focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
              rows={2}
              placeholder="Describe your proper purpose for this request..."
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => submitMutation.mutate()}
          disabled={!name || !docType || (purpose === 'Other (Please specify)' && !customPurpose) || submitMutation.isPending}
          className="btn-primary flex-1"
        >
          {submitMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Submit Request
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-2.5 text-small font-medium text-text-muted hover:text-text-heading transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export function RecordRequestList() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['record-requests'],
    queryFn: api.getRecordRequests,
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

  return (
    <div className="card space-y-3">
      <h3 className="text-sm font-semibold text-text-heading flex items-center gap-2">
        <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
        Record Access Requests
      </h3>

      {requests && requests.length > 0 ? (
        <div className="space-y-2">
          {requests.map((req) => {
            const statusConfig = requestStatusColors[req.status]
            const isExpiring = req.status === 'pending' && (Date.now() - req.createdAt) > 4 * 24 * 60 * 60 * 1000
            return (
              <div
                key={req.id}
                className={`p-3 rounded-md border ${isExpiring ? 'border-brand-energy/40 bg-brand-energy-light/20' : 'border-brand-border-light'}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="text-sm font-semibold text-text-heading">{req.residentName}</span>
                    <span className="text-tiny text-text-muted ml-2">#{req.ticketId}</span>
                  </div>
                  <StatusBadge status={statusConfig.label} />
                </div>
                <p className="text-small text-text-muted">{req.documentType}</p>
                <p className="text-tiny text-text-muted mt-1 italic">"{req.properPurpose}"</p>
                <div className="flex items-center justify-between mt-2 text-tiny">
                  <span className="text-text-muted">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  {isExpiring && (
                    <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--color-energy)' }}>
                      <Clock className="w-3 h-3" />
                      Expires soon
                    </span>
                  )}
                  {req.fulfilledAt && (
                    <span className="text-text-muted">
                      {req.status === 'fulfilled' ? 'Fulfilled: ' : 'Denied: '}
                      {new Date(req.fulfilledAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {req.adminNotes && (
                  <p className="text-tiny mt-1.5 p-2 rounded" style={{ background: 'var(--color-border-light)' }}>
                    <span className="font-semibold">Admin note:</span> {req.adminNotes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-small text-text-muted italic">No record requests yet.</p>
      )}
    </div>
  )
}