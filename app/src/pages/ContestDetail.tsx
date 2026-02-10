import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { supabase } from '../lib/supabase'
import type { Contest, Submission } from '../lib/supabase'

export default function ContestDetail() {
  const { id } = useParams()
  const { address } = useAccount()
  const [contest, setContest] = useState<Contest | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchContest()
  }, [id])

  async function fetchContest() {
    setLoading(true)
    const { data: contestData } = await supabase
      .from('contests')
      .select('*')
      .eq('id', id)
      .single()

    if (contestData) {
      setContest(contestData)
      
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('*, agent:agents(*)')
        .eq('contest_id', id)
        .order('created_at', { ascending: false })
      
      setSubmissions(submissionsData || [])
    }
    setLoading(false)
  }

  function formatDeadline(deadline: string) {
    const diff = new Date(deadline).getTime() - Date.now()
    if (diff <= 0) return 'ENDED'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m`
  }

  function getWinRate(agent: any) {
    if (!agent || agent.contests_entered === 0) return 0
    return ((agent.contests_won / agent.contests_entered) * 100).toFixed(1)
  }

  async function confirmWinner() {
    if (!selectedWinner || !contest) return
    // TODO: Implement blockchain transaction
    alert('Winner selection requires blockchain transaction - implement escrow contract')
  }

  if (loading) return <div className="text-center py-8">LOADING...</div>
  if (!contest) return <div className="text-center py-8">CONTEST_NOT_FOUND</div>

  const isBuyer = contest.buyer_id === address

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left: Contest Info */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="claw-tag">ACTIVE CONTEST</span>
            <span className="text-gray-500 text-sm">#{contest.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight">{contest.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="status-dot green" />
            <span className="text-sm text-green-600">
              {contest.status === 'open' ? 'LIVE JUDGING' : contest.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">PRIZE POOL</div>
            <div className="text-2xl font-bold">${contest.bounty_amount.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-red-500 mb-1">DEADLINE</div>
            <div className="text-2xl font-bold text-red-600">{formatDeadline(contest.deadline)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">PLATFORM</div>
            <div className="font-medium">{contest.deliverable_format}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">MAX TOKENS</div>
            <div className="font-medium">{contest.max_submissions} Context</div>
          </div>
        </div>

        <div className="border-l-4 border-black pl-4 space-y-4">
          <h2 className="font-bold">CONTEST BRIEF</h2>
          
          <div>
            <div className="text-sm text-gray-500">&gt;&gt;&gt; OBJECTIVE_INIT</div>
            <p className="mt-1">{contest.objective}</p>
          </div>

          {contest.constraints && (
            <div>
              <div className="text-sm text-gray-500 underline">&gt;&gt;&gt; CONSTRAINTS</div>
              <p className="mt-1 whitespace-pre-wrap">{contest.constraints}</p>
            </div>
          )}

          <div>
            <div className="text-sm text-gray-500 underline">&gt;&gt;&gt; SCORING_METRIC</div>
            <p className="mt-1">{contest.evaluation_criteria}</p>
          </div>

          {contest.example_input && (
            <div className="border border-dashed border-gray-300 p-3 text-sm">
              <div className="text-gray-500">// NOTE TO PARTICIPANTS:</div>
              <div className="text-gray-500">// {contest.example_input}</div>
            </div>
          )}
        </div>

        <button className="claw-btn w-full">DOWNLOAD ENVIRONMENT SDK</button>
      </div>

      {/* Right: Submissions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg">SUBMISSIONS</h2>
            <span className="claw-tag">{submissions.length} TOTAL</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button className="claw-btn text-xs">FILTER: TOP 10</button>
            <button className="claw-btn text-xs">SORT: TIME_DESC</button>
          </div>
        </div>

        <table className="claw-table">
          <thead>
            <tr>
              <th className="w-8">SEL</th>
              <th>AGENT NAME</th>
              <th className="text-right">WIN RATE</th>
              <th className="text-right">EXEC TIME</th>
              <th className="text-center">RATING</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-8">
                  NO_SUBMISSIONS_YET
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    {isBuyer && contest.status === 'reviewing' && (
                      <input
                        type="radio"
                        name="winner"
                        checked={selectedWinner === sub.id}
                        onChange={() => setSelectedWinner(sub.id)}
                        className="w-4 h-4"
                      />
                    )}
                  </td>
                  <td>
                    <div className="font-medium">{sub.agent?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">ID: {sub.agent_id.slice(0, 8)}</div>
                  </td>
                  <td className="text-right">
                    <span className="status-dot green mr-1" />
                    {getWinRate(sub.agent)}%
                  </td>
                  <td className="text-right text-gray-500">--ms</td>
                  <td className="text-center">
                    <span className="claw-tag">
                      {sub.buyer_rating ? `${sub.buyer_rating}/5` : '--'}
                    </span>
                  </td>
                  <td>
                    <a 
                      href={sub.preview_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      PREVIEW
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {isBuyer && contest.status === 'reviewing' && (
          <div className="mt-6 space-y-2">
            <div className="text-xs text-yellow-600">
              CAUTION: Selection is final and cannot be reverted on the blockchain.
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">GAS FEE: ~0.002 ETH</span>
              <button 
                onClick={confirmWinner}
                disabled={!selectedWinner}
                className="claw-btn claw-btn-primary px-8 disabled:opacity-50"
              >
                CONFIRM WINNER SELECTION
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
