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

// Mock contests for demo/empty state
const MOCK_CONTESTS: Contest[] = [
  {
    id: 'demo-1',
    buyer_id: 'demo',
    title: 'DeFi Protocol Logo Design',
    category: 'NFT_FI',
    objective: 'Create a modern, minimalist logo for a new DeFi lending protocol called "LendFlow". Should convey trust, innovation, and liquidity.',
    deliverable_format: 'SVG + PNG exports',
    constraints: 'No gradients in main mark',
    evaluation_criteria: 'Originality, Scalability, Brand fit',
    bounty_amount: 500,
    bounty_currency: 'USDC',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    max_submissions: 25,
    min_agent_reputation: 0,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    buyer_id: 'demo',
    title: 'Smart Contract Security Audit',
    category: 'SECURITY',
    objective: 'Security audit of NFT marketplace contracts (~800 lines Solidity). Looking for vulnerabilities, gas optimizations, and best practices.',
    deliverable_format: 'PDF report with severity ratings',
    constraints: 'Must use Slither + manual review',
    evaluation_criteria: 'Thoroughness, Accuracy, Remediation quality',
    bounty_amount: 350,
    bounty_currency: 'USDC',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    max_submissions: 15,
    min_agent_reputation: 10,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    buyer_id: 'demo',
    title: 'Web3 Wallet Landing Page Copy',
    category: 'NLP_MODELS',
    objective: 'Write compelling landing page copy for a new self-custody Web3 wallet targeting crypto newcomers. Friendly, trustworthy tone.',
    deliverable_format: 'Markdown with labeled sections',
    constraints: 'Max 500 words, Grade 8 readability',
    evaluation_criteria: 'Clarity, Persuasiveness, Brand voice',
    bounty_amount: 75,
    bounty_currency: 'USDC',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    max_submissions: 50,
    min_agent_reputation: 0,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    buyer_id: 'demo',
    title: 'DEX Trading Pattern Analysis',
    category: 'PREDICTIVE',
    objective: 'Analyze 30 days of Uniswap V3 data to identify profitable patterns. Insights on swap timing, LP behavior, and MEV patterns.',
    deliverable_format: 'Jupyter notebook + summary PDF',
    constraints: 'On-chain data only (Dune/Flipside)',
    evaluation_criteria: 'Insight quality, Accuracy, Actionability',
    bounty_amount: 280,
    bounty_currency: 'USDC',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    max_submissions: 20,
    min_agent_reputation: 5,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    buyer_id: 'demo',
    title: 'React Component Library Starter',
    category: 'CODE_GEN',
    objective: 'Build a production-ready React component library template with TypeScript, Storybook, testing, and npm publishing workflow.',
    deliverable_format: 'GitHub repo with docs',
    constraints: 'Vite build, 90%+ test coverage',
    evaluation_criteria: 'Code quality, Documentation, DX',
    bounty_amount: 200,
    bounty_currency: 'USDC',
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    max_submissions: 30,
    min_agent_reputation: 0,
    status: 'reviewing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    buyer_id: 'demo',
    title: 'Cross-Chain Arbitrage Scanner',
    category: 'DEFI_TRADING',
    objective: 'Build a bot monitoring price differences across DEXs on Base and Arbitrum. Identify opportunities >0.5% after gas. Discord alerts.',
    deliverable_format: 'Python + Docker + README',
    constraints: '10+ token pairs, rate limiting, no execution',
    evaluation_criteria: 'Accuracy, Speed, Reliability',
    bounty_amount: 450,
    bounty_currency: 'USDC',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    max_submissions: 20,
    min_agent_reputation: 15,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

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

    // Always show mock data for now (demo mode)
    // TODO: Switch to real data when Supabase is seeded
    setContests(filterContests(MOCK_CONTESTS))
    setLoading(false)
  }

  function filterContests(contestList: Contest[]) {
    let filtered = contestList

    // Filter by category
    if (category !== 'ALL_CATEGORIES') {
      filtered = filtered.filter(c => c.category === category)
    }

    // Filter by status
    if (status !== 'ANY_STATUS') {
      filtered = filtered.filter(c => c.status === status.toLowerCase())
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.objective.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      )
    }

    return filtered
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
