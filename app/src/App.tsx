import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import { config } from './lib/wagmi'
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

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#000000',
            borderRadius: 'none',
          })}
        >
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
              </Route>
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
