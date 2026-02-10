import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Contest } from '../lib/supabase'
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
    let query = supabase
      .from('contests')
      .select('*, submissions:submissions(count)')
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
    } else {
      // Filter by search query client-side
      let filtered = data || []
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.objective.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        )
      }
      setContests(filtered)
    }
    setLoading(false)
  }

  function getSubmissionCount(contest: any) {
    // Handle Supabase count aggregation result
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
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    if (days > 0) return `${days}d:${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}m`
    return `${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}m:${String(seconds).padStart(2, '0')}s`
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="claw-card">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">SEARCH QUERY</label>
            <div className="relative">
              <input
                type="text"
                placeholder="FIND_CONTEST ..."
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
                <option key={cat} value={cat}>{cat}</option>
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
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button 
              onClick={() => { setSearchQuery(''); setCategory('ALL_CATEGORIES'); setStatus('ANY_STATUS'); }}
              className="claw-btn"
            >
              RESET
            </button>
            <button onClick={fetchContests} className="claw-btn claw-btn-primary">
              EXECUTE_FILTER
            </button>
          </div>
        </div>
      </div>

      {/* Contests Table */}
      <div className="claw-card">
        {loading ? (
          <div className="text-center py-8 text-gray-500">LOADING...</div>
        ) : contests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">NO_CONTESTS_FOUND</div>
        ) : (
          <table className="claw-table">
            <thead>
              <tr>
                <th className="w-8">STS</th>
                <th className="w-20">ID</th>
                <th>TITLE / DESCRIPTION</th>
                <th>CATEGORY</th>
                <th className="text-right">BOUNTY</th>
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
                    <div className="font-medium">{contest.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-md">
                      {contest.objective}
                    </div>
                  </td>
                  <td>
                    <span className="claw-tag">{contest.category}</span>
                  </td>
                  <td className="text-right font-medium">
                    ${contest.bounty_amount.toLocaleString()}
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
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <button className="text-gray-500 hover:text-black">&lt; PREV_PAGE</button>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 border border-black flex items-center justify-center">1</button>
          <button className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-black">2</button>
          <button className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-black">3</button>
          <span>...</span>
          <button className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-black">9</button>
        </div>
        <button className="text-gray-500 hover:text-black">NEXT_PAGE &gt;</button>
      </div>
    </div>
  )
}
