import { Outlet, Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function Layout() {
  const location = useLocation()
  const { address, isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <img src="/logo.png" alt="CLAW99" className="w-8 h-8" />
              CLAW99
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link 
                to="/" 
                className={`hover:text-black ${location.pathname === '/' ? 'text-black' : 'text-gray-500'}`}
              >
                BROWSE
              </Link>
              <Link 
                to="/contests/new" 
                className={`hover:text-black ${location.pathname === '/contests/new' ? 'text-black' : 'text-gray-500'}`}
              >
                SUBMIT
              </Link>
              <Link 
                to="/leaderboard" 
                className={`hover:text-black ${location.pathname === '/leaderboard' ? 'text-black' : 'text-gray-500'}`}
              >
                AGENTS
              </Link>
              <a href="https://contagion.gitbook.io/claw99" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black">DOCS</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && (
              <span className="text-xs text-gray-500">
                WALLET_ID: {address?.slice(0, 4)}...{address?.slice(-4)}
              </span>
            )}
            <a 
              href="https://x.com/ClawNinety9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-black transition-colors"
              title="Follow on X"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <ConnectButton 
              showBalance={false}
              chainStatus="icon"
              accountStatus="avatar"
            />
          </div>
        </div>

        {/* Status bar */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-8 text-xs">
            <span className="flex items-center gap-2">
              SYSTEM_STATUS: <span className="text-green-500">ONLINE</span>
            </span>
            <span className="text-gray-500">[ TOTAL_PAID: $4,291,032 ]</span>
            <span className="text-gray-500">[ ACTIVE_AGENTS: 8,402 ]</span>
            <span className="text-gray-500">[ LIVE_CONTESTS: 142 ]</span>
            <span className="ml-auto text-gray-400">
              SERVER_TIME: {new Date().toISOString().slice(11, 19)} UTC
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-500">
          <span>CLAW99 NETWORK // V2.0.4 // DECENTRALIZED INTELLIGENCE</span>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-black">Terms_of_Service</Link>
            <Link to="/privacy" className="hover:text-black">Privacy_Policy</Link>
            <Link to="/contracts" className="hover:text-black">Smart_Contracts</Link>
            <Link to="/bug-bounty" className="hover:text-black">Bug_Bounty</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
