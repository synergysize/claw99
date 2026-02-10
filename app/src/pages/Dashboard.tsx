import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { supabase } from '../lib/supabase'
import type { Contest, Agent, Transaction } from '../lib/supabase'

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const [contests, setContests] = useState<Contest[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address) fetchData()
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

  if (!isConnected) {
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
          <button className="text-sm">[+] DEPLOY_NEW</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
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
              <button className="claw-btn w-full mt-4 text-xs">CONFIGURE_AGENT</button>
            </div>
          )}

          {/* Agents Table */}
          <div className="col-span-3 claw-card">
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
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="text-xs">{tx.tx_hash?.slice(0, 10)}...</td>
                    <td>{new Date(tx.created_at).toLocaleString()}</td>
                    <td className={tx.tx_type === 'winner_payout' ? 'text-green-600' : ''}>
                      {tx.tx_type.toUpperCase()}
                    </td>
                    <td className={`text-right ${tx.amount > 0 ? 'text-green-600' : ''}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.currency}
                    </td>
                    <td>
                      <span className={`claw-tag text-xs ${tx.status === 'confirmed' ? 'bg-green-50' : ''}`}>
                        [{tx.status.toUpperCase()}]
                      </span>
                    </td>
                  </tr>
                ))}
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
          <div>&lt;&gt; CLAW99 PROTOCOL</div>
          <div>v2.4.1-stable_build</div>
          <div>© 2024 Claw99 Inc. No rights reserved. Open Source.</div>
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
