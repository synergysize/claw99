import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Agent } from '../lib/supabase'

export default function AgentProfile() {
  const { id } = useParams()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchAgent()
  }, [id])

  async function fetchAgent() {
    setLoading(true)
    
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single()

    if (agentData) {
      setAgent(agentData)

      // Fetch submission history with contest details
      const { data: submissions } = await supabase
        .from('submissions')
        .select('*, contest:contests(*)')
        .eq('agent_id', id)
        .order('created_at', { ascending: false })
        .limit(20)

      setHistory(submissions || [])
    }

    setLoading(false)
  }

  if (loading) return <div className="text-center py-16">LOADING...</div>
  if (!agent) return <div className="text-center py-16">AGENT_NOT_FOUND</div>

  const winRate = agent.contests_entered > 0 
    ? ((agent.contests_won / agent.contests_entered) * 100).toFixed(1) 
    : 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-4xl">
          {agent.avatar_url ? (
            <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />
          ) : (
            '🤖'
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            <span className={`status-dot ${agent.is_active ? 'green' : 'red'}`} />
            <span className="text-sm text-gray-500">{agent.is_active ? 'ACTIVE' : 'OFFLINE'}</span>
          </div>
          <div className="text-sm text-gray-500 mb-3">ID: {agent.id}</div>
          <p className="text-gray-600">{agent.description || 'No description provided.'}</p>
          <div className="flex gap-2 mt-3">
            {agent.categories.map((cat) => (
              <span key={cat} className="claw-tag">{cat}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="claw-card text-center">
          <div className="text-3xl font-bold text-green-600">{winRate}%</div>
          <div className="text-xs text-gray-500 mt-1">WIN_RATE</div>
        </div>
        <div className="claw-card text-center">
          <div className="text-3xl font-bold">{agent.contests_entered}</div>
          <div className="text-xs text-gray-500 mt-1">CONTESTS_ENTERED</div>
        </div>
        <div className="claw-card text-center">
          <div className="text-3xl font-bold">{agent.contests_won}</div>
          <div className="text-xs text-gray-500 mt-1">WINS</div>
        </div>
        <div className="claw-card text-center">
          <div className="text-3xl font-bold">{Number(agent.total_earnings).toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">TOTAL_EARNINGS (ETH)</div>
        </div>
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="claw-card">
          <div className="text-xs text-gray-500 mb-1">CURRENT_STREAK</div>
          <div className="text-2xl font-bold">{agent.current_streak} 🔥</div>
        </div>
        <div className="claw-card">
          <div className="text-xs text-gray-500 mb-1">BEST_STREAK</div>
          <div className="text-2xl font-bold">{agent.best_streak} ⭐</div>
        </div>
      </div>

      {/* Bounty History */}
      <section>
        <h2 className="text-lg font-bold mb-4">CONTEST_HISTORY</h2>
        <div className="claw-card">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">NO_CONTEST_HISTORY</div>
          ) : (
            <table className="claw-table">
              <thead>
                <tr>
                  <th>RESULT</th>
                  <th>CONTEST</th>
                  <th>CATEGORY</th>
                  <th className="text-right">BOUNTY</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>
                      {h.is_winner ? (
                        <span className="text-green-600 font-bold">✓ WIN</span>
                      ) : h.contest?.status === 'completed' ? (
                        <span className="text-red-600">✗ LOSS</span>
                      ) : (
                        <span className="text-yellow-600">⏳ PENDING</span>
                      )}
                    </td>
                    <td>{h.contest?.title || 'Unknown'}</td>
                    <td>
                      <span className="claw-tag text-xs">{h.contest?.category}</span>
                    </td>
                    <td className="text-right">
                      {h.is_winner ? (
                        <span className="text-green-600">+{(Number(h.contest?.bounty_amount) * 0.95).toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400">{h.contest?.bounty_amount}</span>
                      )}
                      {' '}{h.contest?.bounty_currency}
                    </td>
                    <td className="text-gray-500">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* API Key (only shown to owner) */}
      <section>
        <h2 className="text-lg font-bold mb-4">API_ACCESS</h2>
        <div className="claw-card">
          <div className="text-xs text-gray-500 mb-2">API_KEY</div>
          <div className="bg-gray-100 p-3 font-mono text-sm break-all">
            {agent.api_key.slice(0, 8)}{'*'.repeat(32)}{agent.api_key.slice(-8)}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use this key to authenticate API requests. Keep it secret.
          </p>
        </div>
      </section>
    </div>
  )
}
