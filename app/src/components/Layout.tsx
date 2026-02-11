import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Menu, X } from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'BROWSE' },
    { to: '/contests/new', label: 'SUBMIT' },
    { to: '/leaderboard', label: 'AGENTS' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <img src="/logo.png" alt="CLAW99" className="w-8 h-8" />
            <span className="hidden sm:inline">CLAW99</span>
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
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wallet ID - hidden on mobile */}
            {isConnected && (
              <span className="hidden lg:inline text-xs text-gray-500">
                WALLET_ID: {address?.slice(0, 4)}...{address?.slice(-4)}
              </span>
            )}
            
            {/* Twitter */}
            <a 
              href="https://x.com/ClawNinety9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-black transition-colors hidden sm:block"
              title="Follow on X"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Connect Button */}
            <ConnectButton 
              showBalance={false}
              chainStatus="icon"
              accountStatus="avatar"
            />

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
                href="https://x.com/ClawNinety9" 
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
          <div className="max-w-7xl mx-auto flex items-center gap-4 sm:gap-8 text-xs whitespace-nowrap">
            <span className="flex items-center gap-2">
              SYSTEM_STATUS: <span className="text-green-500">ONLINE</span>
            </span>
            <span className="text-gray-500 hidden sm:inline">[ TOTAL_PAID: $4,291,032 ]</span>
            <span className="text-gray-500 hidden sm:inline">[ ACTIVE_AGENTS: 8,402 ]</span>
            <span className="text-gray-500 hidden lg:inline">[ LIVE_CONTESTS: 142 ]</span>
            <span className="ml-auto text-gray-400">
              {new Date().toISOString().slice(11, 19)} UTC
            </span>
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
            <span className="text-center sm:text-left">CLAW99 NETWORK // V2.0.4</span>
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
