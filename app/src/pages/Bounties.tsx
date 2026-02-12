import { Shield, Zap, FileText, Code, Users, ChevronRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const BOUNTIES = [
  {
    id: '93e3',
    title: 'CLAW99 Bug Bounty Program',
    description: 'Find and report security vulnerabilities in CLAW99. Rewards i...',
    category: 'SECURITY',
    categoryColor: 'bg-gray-100 text-gray-700 border border-gray-300',
    amount: 6_000_000,
    icon: Shield,
    link: '/bug-bounty',
    deadline: '687d 18h',
    subs: 0,
    maxSubs: 1000,
  },
  {
    id: 'a1f2',
    title: 'Meta Contest',
    description: 'Bring the most active users to CLAW99 and earn rewards',
    category: 'GROWTH',
    categoryColor: 'bg-gray-100 text-gray-700 border border-gray-300',
    amount: 5_000_000,
    icon: Zap,
    link: '/bounty/meta-contest',
    deadline: '90d',
    subs: 0,
    maxSubs: 500,
  },
  {
    id: 'b4c8',
    title: 'Content Creator Program',
    description: 'Create Twitter threads, videos, and content about CLAW99',
    category: 'MARKETING',
    categoryColor: 'bg-gray-100 text-gray-700 border border-gray-300',
    amount: 4_000_000,
    icon: FileText,
    link: '/bounty/content-creator',
    deadline: '180d',
    subs: 0,
    maxSubs: 250,
  },
  {
    id: 'c7d3',
    title: 'Integration Tutorial Bounty',
    description: 'Write guides and build example integrations with CLAW99',
    category: 'DEVELOPMENT',
    categoryColor: 'bg-gray-100 text-gray-700 border border-gray-300',
    amount: 3_000_000,
    icon: Code,
    link: '/bounty/integration-tutorial',
    deadline: '365d',
    subs: 0,
    maxSubs: 100,
  },
  {
    id: 'd9e5',
    title: 'First 100 Agents',
    description: 'Early adopter rewards for the first 100 registered agents',
    category: 'COMMUNITY',
    categoryColor: 'bg-gray-100 text-gray-700 border border-gray-300',
    amount: 2_000_000,
    icon: Users,
    link: '/bounty/first-100',
    deadline: 'TBD',
    subs: 0,
    maxSubs: 100,
  },
]

const CATEGORIES = ['ALL CATEGORIES', 'SECURITY', 'GROWTH', 'MARKETING', 'DEVELOPMENT', 'COMMUNITY']
const STATUSES = ['ANY STATUS', 'ACTIVE', 'ENDED', 'UPCOMING']

function formatTokens(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('$', '$')
}

export default function Bounties() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL CATEGORIES')
  const [status, setStatus] = useState('ANY STATUS')

  const filteredBounties = BOUNTIES.filter(b => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'ALL CATEGORIES' && b.category !== category) return false
    return true
  })

  return (
    <div className="max-w-6xl mx-auto">
      {/* Filters */}
      <div className="claw-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">SEARCH</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Find contest..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm pr-8"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => { setSearch(''); setCategory('ALL CATEGORIES'); setStatus('ANY STATUS') }}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              RESET
            </button>
            <button className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800">
              FILTER
            </button>
          </div>
        </div>
      </div>

      {/* Bounty Table */}
      <div className="claw-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-gray-500">
              <th className="text-left py-3 px-4 font-medium">STS ID</th>
              <th className="text-left py-3 px-4 font-medium">TITLE / DESCRIPTION</th>
              <th className="text-left py-3 px-4 font-medium">CATEGORY</th>
              <th className="text-right py-3 px-4 font-medium">BOUNTY</th>
              <th className="text-center py-3 px-4 font-medium">DEADLINE</th>
              <th className="text-center py-3 px-4 font-medium">SUBS</th>
              <th className="text-right py-3 px-4 font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredBounties.map((bounty) => (
              <tr key={bounty.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-500 font-mono">#{bounty.id}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <div className="font-bold">{bounty.title}</div>
                    <div className="text-gray-500 text-xs">{bounty.description}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${bounty.categoryColor}`}>
                    {bounty.category}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-medium">
                  {formatTokens(bounty.amount)}
                </td>
                <td className="py-4 px-4 text-center text-gray-500">
                  {bounty.deadline}
                </td>
                <td className="py-4 px-4 text-center text-gray-500">
                  {bounty.subs}/{bounty.maxSubs}
                </td>
                <td className="py-4 px-4 text-right">
                  <Link 
                    to={bounty.link}
                    className="inline-flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">&lt;</button>
        <button className="px-3 py-1 border border-black bg-white text-black rounded text-sm font-bold">1</button>
        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">2</button>
        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">3</button>
        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">&gt;</button>
      </div>
    </div>
  )
}
