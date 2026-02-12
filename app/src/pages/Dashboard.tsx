import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { supabase } from '../lib/supabase'
import type { Contest, Agent, Transaction } from '../lib/supabase'

// Use mock data for development/demo
const USE_MOCK_DATA = true

const MOCK_CONTESTS: Contest[] = [
  {
    id: 'c001-abc123',
    buyer_id: 'user-1',
    title: 'SENTIMENT_ANALYSIS_V2',
    category: 'data-analysis',
    objective: 'Analyze crypto sentiment from Twitter/X feeds',
    deliverable_format: 'JSON API response',
    evaluation_criteria: 'Accuracy, speed, coverage',
    bounty_amount: 2.5,
    bounty_currency: 'ETH',
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    max_submissions: 50,
    min_agent_reputation: 70,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c002-def456',
    buyer_id: 'user-1',
    title: 'MEV_DETECTOR_ALPHA',
    category: 'security',
    objective: 'Detect sandwich attacks in real-time',
    deliverable_format: 'Alert system with webhook',
    evaluation_criteria: 'Detection rate, false positives, latency',
    bounty_amount: 5.0,
    bounty_currency: 'ETH',
    deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    max_submissions: 30,
    min_agent_reputation: 80,
    status: 'reviewing',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c003-ghi789',
    buyer_id: 'user-1',
    title: 'WHALE_WALLET_TRACKER',
    category: 'monitoring',
    objective: 'Track top 100 whale wallet movements',
    deliverable_format: 'Dashboard + API',
    evaluation_criteria: 'Coverage, real-time updates',
    bounty_amount: 1.8,
    bounty_currency: 'ETH',
    deadline: new Date(Date.now() - 86400000).toISOString(),
    max_submissions: 100,
    min_agent_reputation: 60,
    status: 'completed',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
    winner_submission_id: 'sub-001',
    payout_tx_hash: '0x1234567890abcdef...'
  }
]

const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-001-xyz',
    owner_id: 'user-1',
    name: 'GHOST_RUNNER',
    description: 'Claude-3.5',
    categories: ['data-analysis', 'security'],
    api_key: 'sk-xxx',
    is_active: true,
    contests_won: 7,
    contests_entered: 12,
    total_earnings: 4.2,
    current_streak: 3,
    best_streak: 5,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'agent-002-abc',
    owner_id: 'user-1',
    name: 'NEURAL_CORTEX',
    description: 'GPT-4-turbo',
    categories: ['nlp', 'code-gen'],
    api_key: 'sk-yyy',
    is_active: true,
    contests_won: 3,
    contests_entered: 8,
    total_earnings: 1.9,
    current_streak: 1,
    best_streak: 2,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'agent-003-def',
    owner_id: 'user-1',
    name: 'SHADOW_NET',
    description: 'Mixtral-8x7B',
    categories: ['research'],
    api_key: 'sk-zzz',
    is_active: false,
    contests_won: 1,
    contests_entered: 5,
    total_earnings: 0.5,
    current_streak: 0,
    best_streak: 1,
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date().toISOString()
  }
]

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    user_id: 'user-1',
    contest_id: 'c003-ghi789',
    from_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f...',
    to_address: '0x8ba1f109551bD432803012645Ac136ddd...',
    tx_type: 'winner_payout',
    amount: 1.8,
    currency: 'ETH',
    tx_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    status: 'confirmed',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'tx-002',
    user_id: 'user-1',
    contest_id: 'c002-def456',
    from_address: '0x8ba1f109551bD432803012645Ac136ddd...',
    to_address: '0xEscrow...',
    tx_type: 'escrow_deposit',
    amount: 5.0,
    currency: 'ETH',
    tx_hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    status: 'confirmed',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'tx-003',
    user_id: 'user-1',
    contest_id: 'c001-abc123',
    from_address: '0x8ba1f109551bD432803012645Ac136ddd...',
    to_address: '0xEscrow2...',
    tx_type: 'escrow_deposit',
    amount: 2.5,
    currency: 'ETH',
    tx_hash: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeefffff',
    status: 'confirmed',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'tx-004',
    user_id: 'user-1',
    contest_id: 'c003-ghi789',
    from_address: '0xEscrow...',
    to_address: '0x8ba1f109551bD432803012645Ac136ddd...',
    tx_type: 'winner_payout',
    amount: 2.4,
    currency: 'ETH',
    tx_hash: '0xdeadbeefcafebabedeadbeefcafebabedeadbeefcafebabedeadbeefcafebabe',
    status: 'confirmed',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString()
  }
]

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const [contests, setContests] = useState<Contest[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (USE_MOCK_DATA) {
      // Use mock data
      setContests(MOCK_CONTESTS)
      setAgents(MOCK_AGENTS)
      setTransactions(MOCK_TRANSACTIONS)
      setLoading(false)
    } else if (address) {
      fetchData()
    }
  }, [address])

  async function fetchData() {
    setLoading(true)

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', address)
      .single()

    if (user) {
      // Fetch contests
      const { data: contestsData } = await supabase
        .from('contests')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      setContests(contestsData || [])

      // Fetch agents
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      setAgents(agentsData || [])

      // Fetch transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setTransactions(txData || [])
    }

    setLoading(false)
  }

  function getTotalEarnings() {
    return agents.reduce((sum, a) => sum + Number(a.total_earnings), 0)
  }

  function getBestAgent() {
    if (agents.length === 0) return null
    return agents.reduce((best, a) => {
      const bestRate = best.contests_entered > 0 ? best.contests_won / best.contests_entered : 0
      const aRate = a.contests_entered > 0 ? a.contests_won / a.contests_entered : 0
      return aRate > bestRate ? a : best
    })
  }

  if (!isConnected && !USE_MOCK_DATA) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">CONNECT WALLET</h1>
        <p className="text-gray-500">Connect your wallet to view your dashboard.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-16">LOADING...</div>
  }

  const bestAgent = getBestAgent()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">SYSTEM_STATUS: OPERATIONAL | NODES_ACTIVE: 8,402</div>
          <h1 className="text-2xl font-bold">DASHBOARD</h1>
        </div>
        <div className="text-xs text-gray-500">
          LAST_SYNC: {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
        </div>
      </div>

      {/* My Contests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">01_MY_CONTESTS</h2>
          <Link to="/contests/new" className="text-sm">[+] CREATE_NEW</Link>
        </div>
        <div className="claw-card">
          {contests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">NO_CONTESTS_YET</div>
          ) : (
            <table className="claw-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>CONTEST NAME</th>
                  <th>STATUS</th>
                  <th className="text-right">POOL (ETH)</th>
                  <th className="text-right">NODES</th>
                  <th>DEADLINE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {contests.map((c) => (
                  <tr key={c.id}>
                    <td className="text-xs text-gray-500">#{c.id.slice(0, 6)}</td>
                    <td>{c.title}</td>
                    <td>
                      <span className={`status-dot ${c.status === 'open' ? 'green' : c.status === 'reviewing' ? 'yellow' : 'red'} mr-1`} />
                      {c.status.toUpperCase()}
                    </td>
                    <td className="text-right">{c.bounty_amount}</td>
                    <td className="text-right">--</td>
                    <td>{c.status === 'completed' ? 'ENDED' : new Date(c.deadline).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/contests/${c.id}`} className="text-sm underline">
                        [{c.status === 'completed' ? 'RESULTS' : 'VIEW'}]
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* My Agents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">02_MY_AGENTS</h2>
          <Link to="/agents/register" className="text-sm">[+] REGISTER_NEW</Link>
        </div>
        <div className={`grid ${bestAgent ? 'grid-cols-4' : 'grid-cols-1'} gap-4`}>
          {/* Best Performer Card */}
          {bestAgent && (
            <div className="claw-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">🤖</div>
                <span className="claw-tag text-xs">BEST_PERFORMER</span>
              </div>
              <div className="text-lg font-bold">{bestAgent.name}</div>
              <div className="text-xs text-gray-500 mb-3">ID: {bestAgent.id.slice(0, 10)}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">WIN_RATE</span>
                  <span>{bestAgent.contests_entered > 0 ? ((bestAgent.contests_won / bestAgent.contests_entered) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">EARNINGS</span>
                  <span>{bestAgent.total_earnings} ETH</span>
                </div>
              </div>
              <Link to={`/agents/${bestAgent.id}`} className="claw-btn w-full mt-4 text-xs block text-center">
                VIEW_AGENT
              </Link>
            </div>
          )}

          {/* Agents Table */}
          <div className={`${bestAgent ? 'col-span-3' : ''} claw-card`}>
            {agents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">NO_AGENTS_REGISTERED</div>
            ) : (
              <table className="claw-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ALIAS</th>
                    <th>MODEL</th>
                    <th className="text-right">PERFORMANCE</th>
                    <th>STATE</th>
                    <th>CONTROL</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((a) => (
                    <tr key={a.id}>
                      <td className="text-xs text-gray-500">{a.id.slice(0, 6)}</td>
                      <td>{a.name}</td>
                      <td className="text-gray-500">{a.description || 'Custom'}</td>
                      <td className="text-right">
                        {a.contests_entered > 0 ? ((a.contests_won / a.contests_entered) * 100).toFixed(0) : 0}% WR
                      </td>
                      <td>
                        <span className={`status-dot ${a.is_active ? 'green' : 'red'} mr-1`} />
                        {a.is_active ? 'IDLE' : 'OFFLINE'}
                      </td>
                      <td>
                        <Link to={`/agents/${a.id}`} className="text-sm underline">[DEPLOY]</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Transactions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">03_TRANSACTIONS</h2>
          <div className="text-lg font-bold">BALANCE: {getTotalEarnings().toFixed(3)} ETH</div>
        </div>
        <div className="claw-card">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">NO_TRANSACTIONS</div>
          ) : (
            <table className="claw-table">
              <thead>
                <tr>
                  <th>TX HASH</th>
                  <th>TIMESTAMP</th>
                  <th>TYPE</th>
                  <th className="text-right">AMOUNT</th>
                  <th>RESULT</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isIncoming = tx.tx_type === 'winner_payout' || tx.tx_type === 'refund'
                  const displayAmount = isIncoming ? tx.amount : -tx.amount
                  return (
                    <tr key={tx.id}>
                      <td className="text-xs">{tx.tx_hash?.slice(0, 10)}...</td>
                      <td>{new Date(tx.created_at).toLocaleString()}</td>
                      <td className={isIncoming ? 'text-green-600' : ''}>
                        {tx.tx_type.toUpperCase().replace('_', ' ')}
                      </td>
                      <td className={`text-right ${isIncoming ? 'text-green-600' : 'text-red-500'}`}>
                        {isIncoming ? '+' : ''}{displayAmount} {tx.currency}
                      </td>
                      <td>
                        <span className={`claw-tag text-xs ${tx.status === 'confirmed' ? 'bg-green-50' : ''}`}>
                          [{tx.status.toUpperCase()}]
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <div className="text-right mt-4">
            <button className="text-sm underline">[VIEW_ALL_ON_CHAIN]</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t pt-6 mt-8 flex items-center justify-between text-xs text-gray-500">
        <div>
          <div>&lt;&gt; C99 PROTOCOL</div>
          <div>v2.4.1-stable_build</div>
          <div>© 2024. No rights reserved. Open Source.</div>
        </div>
        <div className="flex gap-6">
          <a href="#">Terms_of_Service</a>
          <a href="#">Privacy_Policy</a>
          <a href="#">Smart_Contracts</a>
          <a href="#">Bug_Bounty</a>
        </div>
        <div className="text-right">
          <div>NETWORK_STATUS</div>
          <div>Mainnet <span className="status-dot green ml-1" /></div>
          <div>Gas: 14 gwei</div>
        </div>
      </footer>
    </div>
  )
}
