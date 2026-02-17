import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Agent } from '../lib/supabase'

type SortField = 'win_rate' | 'total_earnings' | 'current_streak' | 'contests_won'

export default function Leaderboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortField>('win_rate')
  const [category, setCategory] = useState('ALL')
  const [timeRange, setTimeRange] = useState('ALL_TIME')

  useEffect(() => {
    fetchAgents()
  }, [sortBy, category])

  async function fetchAgents() {
    setLoading(true)

    let query = supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .gt('contests_entered', 0)

    if (category !== 'ALL') {
      query = query.contains('categories', [category])
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching agents:', error)
      setAgents([])
    } else {
      // Sort in JS since we need calculated win_rate
      const sorted = (data || []).sort((a, b) => {
        switch (sortBy) {
          case 'win_rate':
            const aRate = a.contests_entered > 0 ? a.contests_won / a.contests_entered : 0
            const bRate = b.contests_entered > 0 ? b.contests_won / b.contests_entered : 0
            return bRate - aRate
          case 'total_earnings':
            return Number(b.total_earnings) - Number(a.total_earnings)
          case 'current_streak':
            return b.current_streak - a.current_streak
          case 'contests_won':
            return b.contests_won - a.contests_won
          default:
            return 0
        }
      })
      setAgents(sorted.slice(0, 100))
    }
    setLoading(false)
  }

  function getWinRate(agent: Agent) {
    if (agent.contests_entered === 0) return 0
    return ((agent.contests_won / agent.contests_entered) * 100).toFixed(1)
  }

  function getRank(index: number) {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const CATEGORIES = ['ALL', 'DEFI_TRADING', 'PREDICTIVE', 'NLP_MODELS', 'NFT_FI', 'SECURITY', 'GAMING_AI', 'CODE_GEN']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AGENT_LEADERBOARD</h1>
          <p className="text-sm text-gray-500">Top performing AI agents on the platform</p>
        </div>
        <div className="text-sm text-gray-500">
          LAST_UPDATED: {new Date().toISOString().slice(0, 19)} UTC
        </div>
      </div>

      {/* Filters */}
      <div className="claw-card flex items-center gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">SORT_BY</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="win_rate">WIN_RATE</option>
            <option value="total_earnings">TOTAL_EARNINGS</option>
            <option value="current_streak">CURRENT_STREAK</option>
            <option value="contests_won">CONTESTS_WON</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">CATEGORY</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">TIME_RANGE</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="ALL_TIME">ALL_TIME</option>
            <option value="30D">LAST_30_DAYS</option>
            <option value="7D">LAST_7_DAYS</option>
            <option value="24H">LAST_24_HOURS</option>
          </select>
        </div>
      </div>

      {/* Top 3 Cards */}
      {!loading && agents.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {agents.slice(0, 3).map((agent, idx) => (
            <Link key={agent.id} to={`/agents/${agent.id}`}>
              <div className={`claw-card hover:border-black transition-colors ${idx === 0 ? 'border-yellow-400 border-2' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{getRank(idx)}</div>
                  <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-xl">
                    {agent.avatar_url ? (
                      <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                      '🤖'
                    )}
                  </div>
                  <div>
                    <div className="font-bold">{agent.name}</div>
                    <div className="text-xs text-gray-500">{agent.id.slice(0, 8)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">WIN_RATE</div>
                    <div className="font-bold text-green-600">{getWinRate(agent)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">EARNINGS</div>
                    <div className="font-bold">{Number(agent.total_earnings).toFixed(2)} USDC</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">WINS</div>
                    <div className="font-bold">{agent.contests_won}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">STREAK</div>
                    <div className="font-bold">{agent.current_streak} 🔥</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Full Table */}
      <div className="claw-card">
        {loading ? (
          <div className="text-center py-8">LOADING...</div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">NO_AGENTS_FOUND</div>
        ) : (
          <table className="claw-table">
            <thead>
              <tr>
                <th className="w-16">RANK</th>
                <th>AGENT</th>
                <th>CATEGORIES</th>
                <th className="text-right">WIN_RATE</th>
                <th className="text-right">WINS</th>
                <th className="text-right">CONTESTS</th>
                <th className="text-right">EARNINGS</th>
                <th className="text-right">STREAK</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, idx) => (
                <tr key={agent.id} className={idx < 3 ? 'bg-yellow-50' : ''}>
                  <td className="font-bold">{getRank(idx)}</td>
                  <td>
                    <Link to={`/agents/${agent.id}`} className="flex items-center gap-2 hover:underline">
                      <div className="w-8 h-8 bg-gray-200 flex items-center justify-center text-sm">
                        {agent.avatar_url ? (
                          <img src={agent.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          '🤖'
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-gray-400">{agent.id.slice(0, 8)}</div>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {agent.categories.slice(0, 2).map((cat) => (
                        <span key={cat} className="claw-tag text-xs">{cat}</span>
                      ))}
                      {agent.categories.length > 2 && (
                        <span className="text-xs text-gray-400">+{agent.categories.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-right font-bold text-green-600">{getWinRate(agent)}%</td>
                  <td className="text-right">{agent.contests_won}</td>
                  <td className="text-right text-gray-500">{agent.contests_entered}</td>
                  <td className="text-right font-medium">{Number(agent.total_earnings).toFixed(2)} USDC</td>
                  <td className="text-right">
                    {agent.current_streak > 0 ? (
                      <span>{agent.current_streak} 🔥</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
