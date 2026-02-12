import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Contest } from '../lib/supabase'
import { Search, ArrowRight, Lock, Eye } from 'lucide-react'

const CATEGORIES = [
  'ALL_CATEGORIES',
  'DEFI_TRADING',
  'PREDICTIVE',
  'NLP_MODELS',
  'NFT_FI',
  'SECURITY',
  'GAMING_AI',
  'CODE_GEN',
]

const STATUS_OPTIONS = ['ANY_STATUS', 'OPEN', 'REVIEWING', 'CLOSED']

export default function Home() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('ALL_CATEGORIES')
  const [status, setStatus] = useState('ANY_STATUS')

  useEffect(() => {
    fetchContests()
  }, [category, status])

  async function fetchContests() {
    setLoading(true)
    try {
      let query = supabase
        .from('contests')
        .select('*, submissions(count)')
        .order('is_pinned', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (category !== 'ALL_CATEGORIES') {
        query = query.eq('category', category)
      }
      if (status !== 'ANY_STATUS') {
        query = query.eq('status', status.toLowerCase())
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching contests:', error)
        setContests([])
      } else {
        setContests(data || [])
      }
    } catch (err) {
      console.error('Failed to fetch contests:', err)
      setContests([])
    }
    setLoading(false)
  }

  function getSubmissionCount(contest: any) {
    if (contest.submissions && contest.submissions[0]) {
      return contest.submissions[0].count
    }
    return 0
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'open': return 'green'
      case 'reviewing': return 'yellow'
      case 'completed':
      case 'closed': return 'red'
      default: return 'gray'
    }
  }

  function formatDeadline(deadline: string) {
    const diff = new Date(deadline).getTime() - Date.now()
    if (diff <= 0) return 'ENDED'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <div className="claw-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">SEARCH</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Find contest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchContests()}
                className="w-full border border-gray-300 px-3 py-2 text-sm pr-8"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button 
              onClick={() => { setSearchQuery(''); setCategory('ALL_CATEGORIES'); setStatus('ANY_STATUS'); }}
              className="claw-btn flex-1 sm:flex-none"
            >
              RESET
            </button>
            <button onClick={fetchContests} className="claw-btn claw-btn-primary flex-1 sm:flex-none">
              FILTER
            </button>
          </div>
        </div>
      </div>

      {/* Contests */}
      {loading ? (
        <div className="claw-card text-center py-8 text-gray-500">LOADING...</div>
      ) : contests.length === 0 ? (
        <div className="claw-card text-center py-8 text-gray-500">NO_CONTESTS_FOUND</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="claw-card hidden lg:block overflow-x-auto">
            <table className="claw-table">
              <thead>
                <tr>
                  <th className="w-8">STS</th>
                  <th className="w-20">ID</th>
                  <th>TITLE / DESCRIPTION</th>
                  <th>CATEGORY</th>
                  <th className="text-right">BNTY / CURR</th>
                  <th className="text-right">DEADLINE</th>
                  <th className="text-center">SUBS</th>
                  <th className="w-16">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {contests.map((contest) => (
                  <tr key={contest.id}>
                    <td>
                      <span className={`status-dot ${getStatusColor(contest.status)}`} />
                    </td>
                    <td className="text-xs text-gray-500">#{contest.id.slice(0, 4)}</td>
                    <td>
                      <div className="font-medium flex items-center gap-1">
                        {(contest as any).is_pinned && <span title="Pinned">📌</span>}
                        {contest.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-md">
                        {contest.objective}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(contest as any).labels?.includes('CLAW99') && (
                          <span className="claw-tag bg-black text-white">CLAW99</span>
                        )}
                        <span className="claw-tag">{contest.category}</span>
                      </div>
                    </td>
                    <td className="text-right font-medium whitespace-nowrap">
                      {contest.bounty_amount.toLocaleString()} <span className="text-gray-500 font-normal">{contest.bounty_currency}</span>
                    </td>
                    <td className="text-right">
                      {contest.status === 'reviewing' ? (
                        <span className="text-yellow-600">REVIEWING</span>
                      ) : contest.status === 'completed' ? (
                        <span className="text-red-600">CLOSED</span>
                      ) : (
                        formatDeadline(contest.deadline)
                      )}
                    </td>
                    <td className="text-center text-gray-500">
                      {getSubmissionCount(contest)}/{contest.max_submissions}
                    </td>
                    <td>
                      <Link to={`/contests/${contest.id}`}>
                        {contest.status === 'completed' ? (
                          <Lock className="w-4 h-4 text-gray-400 mx-auto" />
                        ) : contest.status === 'reviewing' ? (
                          <Eye className="w-4 h-4 text-yellow-500 mx-auto" />
                        ) : (
                          <ArrowRight className="w-4 h-4 mx-auto" />
                        )}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {contests.map((contest) => (
              <Link 
                key={contest.id} 
                to={`/contests/${contest.id}`}
                className="claw-card block hover:border-gray-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`status-dot ${getStatusColor(contest.status)}`} />
                      <span className="text-xs text-gray-400">#{contest.id.slice(0, 4)}</span>
                      {(contest as any).labels?.includes('CLAW99') && (
                        <span className="claw-tag text-xs bg-black text-white">CLAW99</span>
                      )}
                      <span className="claw-tag text-xs">{contest.category}</span>
                    </div>
                    <h3 className="font-medium text-sm mb-1 truncate flex items-center gap-1">
                      {(contest as any).is_pinned && <span>📌</span>}
                      {contest.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{contest.objective}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg">{contest.bounty_amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{contest.bounty_currency}</div>
                    <div className="text-xs text-gray-500">
                      {contest.status === 'reviewing' ? (
                        <span className="text-yellow-600">REVIEWING</span>
                      ) : contest.status === 'completed' ? (
                        <span className="text-red-600">CLOSED</span>
                      ) : (
                        formatDeadline(contest.deadline)
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>{getSubmissionCount(contest)}/{contest.max_submissions} submissions</span>
                  <span className="flex items-center gap-1">
                    VIEW <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {contests.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button className="px-3 py-2 text-gray-500 hover:text-black">&lt;</button>
          <button className="w-8 h-8 border border-black flex items-center justify-center">1</button>
          <button className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-black hidden sm:flex">2</button>
          <button className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-black hidden sm:flex">3</button>
          <button className="px-3 py-2 text-gray-500 hover:text-black">&gt;</button>
        </div>
      )}
    </div>
  )
}
