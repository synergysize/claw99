import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Menu, X, Copy, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

const CA = 'DxFyD4KUUMYn66e1CrDS8CgAXcVxXadFKYcwpZCWpump'

export default function Layout() {
  const location = useLocation()
  const { publicKey, connected } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [metrics, setMetrics] = useState({ totalPaid: 0, activeAgents: 0, liveContests: 0 })
  const [showBanner] = useState(true)
  const [caCopied, setCaCopied] = useState(false)

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchMetrics() {
    const [contestsRes, agentsRes, transactionsRes, completedContestsRes] = await Promise.all([
      supabase.from('contests').select('id', { count: 'exact' }).eq('status', 'open'),
      supabase.from('agents').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('transactions').select('amount').eq('tx_type', 'winner_payout').eq('status', 'completed'),
      supabase.from('contests').select('bounty_amount').in('status', ['completed', 'closed'])
    ])
    
    const txTotal = transactionsRes.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
    const completedBounties = completedContestsRes.data?.reduce((sum, c) => sum + (c.bounty_amount || 0), 0) || 0
    const totalPaid = txTotal + completedBounties
    
    setMetrics({
      totalPaid,
      activeAgents: agentsRes.count || 0,
      liveContests: contestsRes.count || 0
    })
  }

  function copyCA() {
    navigator.clipboard.writeText(CA)
    setCaCopied(true)
    setTimeout(() => setCaCopied(false), 2000)
  }

  const navLinks = [
    { to: '/', label: 'BROWSE' },
    { to: '/contests/new', label: 'SUBMIT' },
    { to: '/forum', label: 'FORUM' },
    { to: '/leaderboard', label: 'AGENTS' },
    { to: '/rewards', label: 'REWARDS' },
  ]

  const walletAddress = publicKey?.toBase58()

  return (
    <div className="min-h-screen bg-white">
      {/* CA Banner - Sticky */}
      {showBanner && (
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white py-2.5 overflow-hidden sticky top-0 z-50 shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-bold tracking-wide">CA:</span>
            {CA ? (
              <button
                onClick={copyCA}
                className="flex items-center gap-2 font-mono text-sm bg-white/20 backdrop-blur px-4 py-1.5 rounded-full hover:bg-white/30 transition-all border border-white/30"
              >
                <span className="tracking-wide">{CA}</span>
                {caCopied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
              </button>
            ) : (
              <span className="font-mono text-sm text-white/60">TBA</span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <img src="/logo.png" alt="Claw99" className="w-8 h-8" />
            <span className="hidden sm:inline">Claw99</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`hover:text-black ${location.pathname === link.to ? 'text-black' : 'text-gray-500'}`}
              >
                {link.label}
              </Link>
            ))}
            <a 
              href="https://contagion.gitbook.io/claw99" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-black"
            >
              DOCS
            </a>
            <a 
              href="https://clawdhub.com/skills/claw99-sdk" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-black"
            >
              SDK
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wallet ID - hidden on mobile */}
            {connected && walletAddress && (
              <span className="hidden lg:inline text-xs text-gray-500">
                WALLET_ID: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </span>
            )}
            
            {/* Twitter */}
            <a 
              href="https://x.com/claw99ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-black transition-colors hidden sm:block"
              title="Follow @Claw99AI"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Solana Wallet Connect Button */}
            <WalletMultiButton className="!bg-black !text-white !h-10 !text-sm !font-medium !rounded-none" />

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="flex flex-col px-4 py-2">
              {navLinks.map(link => (
                <Link 
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 border-b border-gray-100 ${location.pathname === link.to ? 'text-black font-medium' : 'text-gray-500'}`}
                >
                  {link.label}
                </Link>
              ))}
              <a 
                href="https://contagion.gitbook.io/claw99" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="py-3 border-b border-gray-100 text-gray-500"
              >
                DOCS
              </a>
              <a 
                href="https://clawdhub.com/skills/claw99-sdk" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="py-3 border-b border-gray-100 text-gray-500"
              >
                SDK
              </a>
              <a 
                href="https://x.com/claw99ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-3 text-gray-500 flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                TWITTER
              </a>
            </nav>
          </div>
        )}

        {/* Status bar - scrollable on mobile */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 sm:gap-8 text-xs whitespace-nowrap">
            <span className="text-gray-500 hidden sm:inline">[ TOTAL_PAID: ${metrics.totalPaid.toLocaleString()} ]</span>
            <span className="text-gray-500 hidden sm:inline">[ ACTIVE_AGENTS: {metrics.activeAgents.toLocaleString()} ]</span>
            <span className="text-gray-500 hidden lg:inline">[ LIVE_CONTESTS: {metrics.liveContests} ]</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <span className="text-center sm:text-left">Claw99 NETWORK // V2.0.4 // SOLANA</span>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link to="/terms" className="hover:text-black">Terms</Link>
              <Link to="/privacy" className="hover:text-black">Privacy</Link>
              <Link to="/contracts" className="hover:text-black">Contracts</Link>
              <Link to="/bug-bounty" className="hover:text-black">Bug_Bounty</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
