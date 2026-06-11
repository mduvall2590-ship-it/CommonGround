import { useState } from 'react'
import { Check, X, Minus, Loader2 } from 'lucide-react'
import type { VoteResult } from '../types'
import { api } from '../api'

interface VoteButtonProps {
  option: string
  onClick: (option: string) => void
  state: 'default' | 'selected' | 'disabled' | 'expired' | 'loading'
  votedOption?: string | null
}

export function VoteButton({ option, onClick, state, votedOption }: VoteButtonProps) {
  const isActive = state === 'default'
  const isSelected = state === 'selected' || (state === 'disabled' && votedOption === option)
  const isLoading = state === 'loading'

  const configs: Record<string, { label: string; icon: typeof Check; className: string }> = {
    Yes: { label: 'YES — Let\'s do this!', icon: Check, className: 'btn-vote-yes' },
    No: { label: 'NO — Not right now', icon: X, className: 'btn-vote-no' },
    Abstain: { label: 'ABSTAIN', icon: Minus, className: 'btn-vote-abstain' },
  }

  const config = configs[option]
  if (!config) return null

  const Icon = config.icon

  return (
    <button
      onClick={() => isActive && onClick(option)}
      disabled={!isActive && !isLoading}
      className={`${config.className} ${isSelected ? 'voted' : ''} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isSelected ? (
        <Check className="w-5 h-5" />
      ) : (
        <Icon className="w-5 h-5" />
      )}
      {config.label}
    </button>
  )
}

interface VotingInterfaceProps {
  proposalId: string
  options: string[]
  endDate: number
  status: string
  onVoteSuccess: (result: VoteResult) => void
}

export default function VotingInterface({ proposalId, options, endDate, status, onVoteSuccess }: VotingInterfaceProps) {
  const [votedOption, setVotedOption] = useState<string | null>(null)
  const [loadingOption, setLoadingOption] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isExpired = status !== 'VOTING'
  const userId = 'u-001' // Current user ID (mock)

  const handleVote = async (option: string) => {
    setLoadingOption(option)
    setError(null)
    setSuccessMessage(null)
    try {
      const result = await api.castVote(proposalId, option, userId)
      setVotedOption(option)
      setSuccessMessage(result.message)
      onVoteSuccess(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vote failed')
    } finally {
      setLoadingOption(null)
    }
  }

  const getButtonState = (option: string): 'default' | 'selected' | 'disabled' | 'expired' => {
    if (isExpired) return 'expired'
    if (loadingOption === option) return 'loading' as any
    if (votedOption) return 'disabled'
    if (votedOption === option) return 'selected'
    return 'default'
  }

  return (
    <div className="space-y-3">
      {isExpired && (
        <p className="text-small text-text-muted italic text-center py-2">
          Voting has ended for this proposal
        </p>
      )}

      {options.map((option) => (
        <VoteButton
          key={option}
          option={option}
          onClick={handleVote}
          state={getButtonState(option)}
          votedOption={votedOption}
        />
      ))}

      {successMessage && (
        <div className="mt-3 p-3 rounded-md text-sm font-medium text-center animate-fade-in-up" style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-md text-sm font-medium text-center" style={{ background: 'var(--color-energy-light)', color: '#9B1C1C' }}>
          {error}
        </div>
      )}
    </div>
  )
}