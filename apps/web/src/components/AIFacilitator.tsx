import { Bot, ExternalLink, Lightbulb, BarChart3 } from 'lucide-react'
import type { Proposal } from '../types'

interface AIFacilitatorProps {
  proposal: Proposal
}

export default function AIFacilitator({ proposal }: AIFacilitatorProps) {
  return (
    <div className="card-dark space-y-4">
      <div className="flex items-center gap-2">
        <Bot className="w-5 h-5" />
        <span className="font-semibold text-sm">AI FACILITATOR</span>
      </div>

      <div className="card-dark-sub space-y-2">
        <div className="flex items-center gap-2 text-white/80">
          <Lightbulb className="w-4 h-4" />
          <span className="font-semibold text-xs uppercase tracking-wider">Proposal Summary</span>
        </div>
        <p className="text-sm text-white/90 leading-relaxed">
          {proposal.aiSummary}
        </p>
      </div>

      <div className="card-dark-sub space-y-2">
        <div className="flex items-center gap-2 text-white/80">
          <BarChart3 className="w-4 h-4" />
          <span className="font-semibold text-xs uppercase tracking-wider">Status Insight</span>
        </div>
        <p className="text-sm text-white/90 leading-relaxed">
          {proposal.aiInsight}
        </p>
      </div>

      {proposal.type === 'FINANCIAL' || proposal.type === 'BUDGET' ? (
        <a
          href="/ledger"
          className="flex items-center gap-2 text-sm font-semibold text-white hover:text-white/80 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Community Ledger
        </a>
      ) : proposal.type === 'GOVERNANCE' ? (
        <p className="text-tiny text-white/70 italic">
          AI analysis: This proposal would modify community bylaws. Implications include changes to governance structure.
        </p>
      ) : null}
    </div>
  )
}