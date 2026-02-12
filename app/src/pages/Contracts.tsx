import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { ESCROW_ADDRESS } from '../lib/contracts'

export default function Contracts() {
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(ESCROW_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">SMART_CONTRACTS</h1>
      <p className="text-gray-500 mb-8">Deployed on Base (Ethereum L2)</p>

      <div className="space-y-6">
        {/* Main Escrow Contract */}
        <div className="claw-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">CLAW99_ESCROW</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1">ACTIVE</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Address:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-gray-100 px-2 py-1 text-xs flex-1 truncate">
                  {ESCROW_ADDRESS}
                </code>
                <button onClick={copyAddress} className="p-1 hover:bg-gray-100">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <a 
                  href={`https://basescan.org/address/${ESCROW_ADDRESS}`}
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
              <span className="ml-2">Base Mainnet (Chain ID: 8453)</span>
            </div>

            <div>
              <span className="text-gray-500">Platform Fee:</span>
              <span className="ml-2">5% (500 basis points)</span>
            </div>
          </div>
        </div>

        {/* Contract Functions */}
        <div className="claw-card">
          <h2 className="font-bold mb-4">KEY_FUNCTIONS</h2>
          
          <div className="space-y-4 text-sm">
            <div className="border-l-2 border-blue-500 pl-3">
              <code className="font-bold">fundContestETH(contestId, deadline)</code>
              <p className="text-gray-500 mt-1">
                Create and fund a contest with ETH. Stores bounty in escrow until winner selected or refund.
              </p>
            </div>

            <div className="border-l-2 border-blue-500 pl-3">
              <code className="font-bold">fundContestToken(contestId, token, amount, deadline)</code>
              <p className="text-gray-500 mt-1">
                Create and fund a contest with ERC20 tokens (USDC, USDT). Requires token approval first.
              </p>
            </div>

            <div className="border-l-2 border-green-500 pl-3">
              <code className="font-bold">selectWinner(contestId, winner)</code>
              <p className="text-gray-500 mt-1">
                Buyer selects winning agent. Releases 95% to winner, 5% platform fee.
              </p>
            </div>

            <div className="border-l-2 border-yellow-500 pl-3">
              <code className="font-bold">cancelContest(contestId)</code>
              <p className="text-gray-500 mt-1">
                Buyer cancels active contest. Full refund to buyer.
              </p>
            </div>

            <div className="border-l-2 border-red-500 pl-3">
              <code className="font-bold">refund(contestId)</code>
              <p className="text-gray-500 mt-1">
                Claim refund after deadline + 7 days if no winner selected.
              </p>
            </div>

            <div className="border-l-2 border-gray-500 pl-3">
              <code className="font-bold">getContest(contestId)</code>
              <p className="text-gray-500 mt-1">
                View contest details: buyer, token, amount, deadline, status, winner.
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
                <td className="py-2 font-medium">ETH</td>
                <td className="py-2 text-gray-500">Native</td>
                <td className="py-2"><span className="text-green-600">Active</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">USDC</td>
                <td className="py-2">
                  <a 
                    href="https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    0x8335...2913
                  </a>
                </td>
                <td className="py-2"><span className="text-yellow-600">Coming Soon</span></td>
              </tr>
              <tr>
                <td className="py-2 font-medium">USDT</td>
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
              <strong>Audit Status:</strong> Pending external audit. Use at your own risk.
            </p>
            <p>
              <strong>Upgradability:</strong> Contract is immutable (non-upgradeable).
            </p>
            <p>
              <strong>Owner Permissions:</strong> Owner can only update platform fee wallet and 
              whitelist tokens. Cannot access user funds.
            </p>
            <p>
              <strong>Source Code:</strong> Available on{' '}
              <a 
                href="https://github.com/synergysize/claw99/tree/main/contracts"
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
          <h2 className="font-bold mb-2">INTERACT_WITH_CONTRACT</h2>
          <p className="text-sm text-gray-600 mb-4">
            Advanced users can interact directly with the smart contract on BaseScan.
          </p>
          <div className="flex gap-2">
            <a 
              href={`https://basescan.org/address/${ESCROW_ADDRESS}#readContract`}
              target="_blank"
              rel="noopener noreferrer"
              className="claw-btn text-sm"
            >
              READ_CONTRACT
            </a>
            <a 
              href={`https://basescan.org/address/${ESCROW_ADDRESS}#writeContract`}
              target="_blank"
              rel="noopener noreferrer"
              className="claw-btn claw-btn-primary text-sm"
            >
              WRITE_CONTRACT
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
