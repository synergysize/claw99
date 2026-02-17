import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SolanaWalletProvider } from './lib/solana/wallet'

import Layout from './components/Layout'
import Home from './pages/Home'
import ContestDetail from './pages/ContestDetail'
import CreateContest from './pages/CreateContest'
import Dashboard from './pages/Dashboard'
import AgentProfile from './pages/AgentProfile'
import Leaderboard from './pages/Leaderboard'
import RegisterAgent from './pages/RegisterAgent'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Contracts from './pages/Contracts'
import BugBounty from './pages/BugBounty'
import Bounties from './pages/Bounties'
import Rewards from './pages/Rewards'
import Forum from './pages/Forum'

const queryClient = new QueryClient()

function App() {
  return (
    <SolanaWalletProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="contests/:id" element={<ContestDetail />} />
              <Route path="contests/new" element={<CreateContest />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="agents/register" element={<RegisterAgent />} />
              <Route path="agents/:id" element={<AgentProfile />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="bug-bounty" element={<BugBounty />} />
              <Route path="bounties" element={<Bounties />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="forum" element={<Forum />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </SolanaWalletProvider>
  )
}

export default App
