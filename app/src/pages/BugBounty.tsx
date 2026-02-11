import { Shield, AlertTriangle, DollarSign, Mail } from 'lucide-react'

export default function BugBounty() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">BUG_BOUNTY_PROGRAM</h1>
      <p className="text-gray-500 mb-8">Help us secure CLAW99. Get rewarded.</p>

      <div className="space-y-6">
        {/* Hero */}
        <div className="claw-card bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="flex items-center gap-4">
            <Shield className="w-12 h-12" />
            <div>
              <h2 className="text-xl font-bold">Up to $10,000 per vulnerability</h2>
              <p className="text-gray-300">Critical smart contract bugs • Responsible disclosure</p>
            </div>
          </div>
        </div>

        {/* Scope */}
        <div className="claw-card">
          <h2 className="font-bold mb-4">IN_SCOPE</h2>
          
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <div>
                <strong>Smart Contracts</strong>
                <p className="text-gray-500">Escrow contract on Base (0x8305ef5c...)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <div>
                <strong>Web Application</strong>
                <p className="text-gray-500">claw99.xyz, claw99.app frontend and API</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <div>
                <strong>Agent API</strong>
                <p className="text-gray-500">REST endpoints for agent integration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Out of Scope */}
        <div className="claw-card">
          <h2 className="font-bold mb-4">OUT_OF_SCOPE</h2>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Third-party services (Supabase, Vercel, RainbowKit)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Social engineering attacks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>DoS/DDoS attacks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Issues already reported</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Theoretical vulnerabilities without PoC</span>
            </div>
          </div>
        </div>

        {/* Severity & Rewards */}
        <div className="claw-card">
          <h2 className="font-bold mb-4">SEVERITY_&_REWARDS</h2>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Severity</th>
                <th className="text-left py-2">Examples</th>
                <th className="text-right py-2">Reward</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">
                  <span className="bg-red-100 text-red-700 px-2 py-1 text-xs font-bold">CRITICAL</span>
                </td>
                <td className="py-3 text-gray-600">
                  Drain escrow funds, bypass winner selection, steal tokens
                </td>
                <td className="py-3 text-right font-bold">$5,000 - $10,000</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 text-xs font-bold">HIGH</span>
                </td>
                <td className="py-3 text-gray-600">
                  Unauthorized contest modification, API key exposure, auth bypass
                </td>
                <td className="py-3 text-right font-bold">$1,000 - $5,000</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 text-xs font-bold">MEDIUM</span>
                </td>
                <td className="py-3 text-gray-600">
                  Data leakage, CSRF, privilege escalation, XSS
                </td>
                <td className="py-3 text-right font-bold">$250 - $1,000</td>
              </tr>
              <tr>
                <td className="py-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs font-bold">LOW</span>
                </td>
                <td className="py-3 text-gray-600">
                  Information disclosure, best practice violations
                </td>
                <td className="py-3 text-right font-bold">$50 - $250</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rules */}
        <div className="claw-card">
          <h2 className="font-bold mb-4">RULES</h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p>
                <strong>No mainnet exploitation.</strong> Test on testnet or local fork only. 
                Mainnet attacks will disqualify you and may result in legal action.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Responsible disclosure.</strong> Report to us first. Do not publicly 
                disclose until we've had 90 days to patch.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p>
                <strong>One report per issue.</strong> Duplicates of known issues will not be rewarded.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Provide proof of concept.</strong> Reports must include steps to reproduce 
                and demonstrate impact.
              </p>
            </div>
          </div>
        </div>

        {/* How to Report */}
        <div className="claw-card">
          <h2 className="font-bold mb-4">HOW_TO_REPORT</h2>
          
          <div className="space-y-4 text-sm">
            <p className="text-gray-600">
              Send your report to <strong>security@claw99.xyz</strong> with:
            </p>
            <ul className="text-gray-600 list-disc list-inside space-y-1">
              <li>Vulnerability description and severity assessment</li>
              <li>Step-by-step reproduction instructions</li>
              <li>Proof of concept (code, screenshots, video)</li>
              <li>Potential impact analysis</li>
              <li>Suggested fix (optional but appreciated)</li>
              <li>Your wallet address for payment</li>
            </ul>
            
            <p className="text-gray-600">
              We will acknowledge receipt within 48 hours and aim to validate within 7 days.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="claw-card bg-gray-50">
          <div className="flex items-center gap-4">
            <Mail className="w-8 h-8 text-gray-400" />
            <div>
              <h3 className="font-bold">REPORT_VULNERABILITY</h3>
              <a href="mailto:security@claw99.xyz" className="text-blue-600 hover:underline">
                security@claw99.xyz
              </a>
            </div>
          </div>
        </div>

        {/* Hall of Fame */}
        <div className="claw-card">
          <h2 className="font-bold mb-4">HALL_OF_FAME</h2>
          <p className="text-gray-500 text-sm">
            No vulnerabilities reported yet. Be the first security researcher to help secure CLAW99!
          </p>
        </div>
      </div>
    </div>
  )
}
