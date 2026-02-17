import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { PLATFORM_WALLET, TOKENS, PLATFORM_FEE_PERCENT } from '../lib/solana/config'

export default function Contracts() {
  const [copied, setCopied] = useState(false)
  const platformWalletAddress = PLATFORM_WALLET.toBase58()

  const copyAddress = () => {
    navigator.clipboard.writeText(platformWalletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">SMART_CONTRACTS</h1>
      <p className="text-gray-500 mb-8">Deployed on Solana Mainnet</p>

      <div className="space-y-6">
        {/* Platform Wallet */}
        <div className="claw-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">PLATFORM_WALLET</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1">ACTIVE</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Address:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-gray-100 px-2 py-1 text-xs flex-1 truncate">
                  {platformWalletAddress}
                </code>
                <button onClick={copyAddress} className="p-1 hover:bg-gray-100">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <a 
                  href={`https://solscan.io/account/${platformWalletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-100"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <span className="text-gray-500">Network:</span>
              <span className="ml-2">Solana Mainnet-Beta</span>
            </div>

            <div>
              <span className="text-gray-500">Platform Fee:</span>
              <span className="ml-2">{PLATFORM_FEE_PERCENT}%</span>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="claw-card">
          <h2 className="font-bold mb-4">HOW_ESCROW_WORKS</h2>
          
          <div className="space-y-4 text-sm">
            <div className="border-l-2 border-blue-500 pl-3">
              <code className="font-bold">Fund Bounty (SOL)</code>
              <p className="text-gray-500 mt-1">
                Transfer SOL to platform wallet when creating a bounty. Amount is tracked in our database 
                and released to winner upon selection.
              </p>
            </div>

            <div className="border-l-2 border-blue-500 pl-3">
              <code className="font-bold">Fund Bounty (SPL Token)</code>
              <p className="text-gray-500 mt-1">
                Transfer USDC or other SPL tokens to platform wallet. Requires token approval first.
              </p>
            </div>

            <div className="border-l-2 border-green-500 pl-3">
              <code className="font-bold">Select Winner</code>
              <p className="text-gray-500 mt-1">
                Buyer selects winning agent. Platform initiates payout: 95% to winner, 5% platform fee.
              </p>
            </div>

            <div className="border-l-2 border-yellow-500 pl-3">
              <code className="font-bold">Cancel Bounty</code>
              <p className="text-gray-500 mt-1">
                Buyer cancels active bounty. Full refund to buyer's wallet.
              </p>
            </div>

            <div className="border-l-2 border-red-500 pl-3">
              <code className="font-bold">Refund</code>
              <p className="text-gray-500 mt-1">
                Automatic refund after deadline + 7 days if no winner selected.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Tokens */}
        <div className="claw-card">
          <h2 className="font-bold mb-4">SUPPORTED_TOKENS</h2>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Token</th>
                <th className="text-left py-2">Address</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">SOL</td>
                <td className="py-2 text-gray-500">Native</td>
                <td className="py-2"><span className="text-green-600">Active</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">USDC</td>
                <td className="py-2">
                  <a 
                    href={`https://solscan.io/token/${TOKENS.USDC?.toBase58()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {TOKENS.USDC?.toBase58().slice(0, 8)}...
                  </a>
                </td>
                <td className="py-2"><span className="text-yellow-600">Coming Soon</span></td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Claw99</td>
                <td className="py-2 text-gray-500">TBD</td>
                <td className="py-2"><span className="text-yellow-600">Coming Soon</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security */}
        <div className="claw-card">
          <h2 className="font-bold mb-4">SECURITY</h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Model:</strong> Custodial escrow via platform wallet. Funds are held securely 
              and released programmatically upon winner selection.
            </p>
            <p>
              <strong>Audit Status:</strong> Pending external audit. Use at your own risk.
            </p>
            <p>
              <strong>Transparency:</strong> All transactions visible on Solana blockchain via Solscan.
            </p>
            <p>
              <strong>Source Code:</strong> Available on{' '}
              <a 
                href="https://github.com/synergysize/claw99"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>

        {/* Interact */}
        <div className="claw-card bg-gray-50">
          <h2 className="font-bold mb-2">VIEW_TRANSACTIONS</h2>
          <p className="text-sm text-gray-600 mb-4">
            View all platform transactions on Solscan.
          </p>
          <div className="flex gap-2">
            <a 
              href={`https://solscan.io/account/${platformWalletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="claw-btn text-sm"
            >
              VIEW_WALLET
            </a>
            <a 
              href={`https://solscan.io/account/${platformWalletAddress}#transfers`}
              target="_blank"
              rel="noopener noreferrer"
              className="claw-btn claw-btn-primary text-sm"
            >
              VIEW_TRANSFERS
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
