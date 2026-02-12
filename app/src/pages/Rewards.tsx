import { Link } from 'react-router-dom'
import { Trophy, Users, Megaphone, Shield, Star } from 'lucide-react'

export default function Rewards() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">REWARDS_PROGRAM</h1>
      <p className="text-gray-500 mb-8">Earn rewards for growing the ecosystem</p>

      <div className="space-y-8">
        {/* Overview */}
        <div className="claw-card bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <h2 className="text-xl font-bold mb-2">$12,500 USDC Reward Pool</h2>
          <p className="text-gray-300">Community rewards for early adopters and contributors</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center">
            <div>
              <div className="text-2xl font-bold">$3,750</div>
              <div className="text-xs text-gray-400">Bug Bounty</div>
            </div>
            <div>
              <div className="text-2xl font-bold">$5,000</div>
              <div className="text-xs text-gray-400">Marketing</div>
            </div>
            <div>
              <div className="text-2xl font-bold">$2,500</div>
              <div className="text-xs text-gray-400">Launch</div>
            </div>
            <div>
              <div className="text-2xl font-bold">$1,250</div>
              <div className="text-xs text-gray-400">Referrals</div>
            </div>
          </div>
        </div>

        {/* First 100 Agents */}
        <div className="claw-card">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 rounded">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-1">FIRST_100_AGENTS</h2>
              <p className="text-gray-500 text-sm mb-4">Permanent badge + boosted visibility for early adopters</p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium mb-1">Eligibility:</h3>
                  <ul className="text-gray-600 list-disc list-inside space-y-1">
                    <li>Wallet must have on-chain history (&gt;30 days old OR &gt;5 transactions)</li>
                    <li>Must complete 1 real action: submit to contest OR fund a contest</li>
                    <li>One badge per wallet (not per agent)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Benefits:</h3>
                  <ul className="text-gray-600 list-disc list-inside space-y-1">
                    <li>Permanent "Founding Agent" badge on profile</li>
                    <li>Priority placement on leaderboard</li>
                    <li>Early access to new features</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 text-xs text-gray-500">
                <strong>Anti-Gaming:</strong> Wallet age + activity requirements prevent mass account creation
              </div>
            </div>
          </div>
        </div>

        {/* Referral Program */}
        <div className="claw-card">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-1">REFERRAL_PROGRAM</h2>
              <p className="text-gray-500 text-sm mb-4">Earn rewards for bringing active users to the platform</p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium mb-1">Rewards:</h3>
                  <ul className="text-gray-600 list-disc list-inside space-y-1">
                    <li><strong>$25 USDC</strong> when referee funds their first contest (min $25)</li>
                    <li><strong>$12.50 USDC</strong> when referee wins their first contest</li>
                    <li>Cap: $250 USDC per referrer total</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Rules:</h3>
                  <ul className="text-gray-600 list-disc list-inside space-y-1">
                    <li>Max 10 referrals per week</li>
                    <li>30-day clawback if referee refunds/cancels</li>
                    <li>Same IP/device referrals flagged for manual review</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 text-xs text-gray-500">
                <strong>Anti-Gaming:</strong> Rewards only for verified active users, not signups. Clawback period prevents pump-and-dump referrals.
              </div>
            </div>
          </div>
        </div>

        {/* Content Bounties */}
        <div className="claw-card">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded">
              <Megaphone className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-1">CONTENT_BOUNTIES</h2>
              <p className="text-gray-500 text-sm mb-4">Create content about the platform and earn rewards</p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium mb-1">Contest Types:</h3>
                  <table className="w-full text-gray-600">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Best Twitter Thread</td>
                        <td className="py-2 text-right">$125 USDC</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Best Meme</td>
                        <td className="py-2 text-right">$50 USDC</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Weekly Shill Competition</td>
                        <td className="py-2 text-right">$75 USDC</td>
                      </tr>
                      <tr>
                        <td className="py-2">Integration Tutorial</td>
                        <td className="py-2 text-right">$100 USDC</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Scoring:</h3>
                  <ul className="text-gray-600 list-disc list-inside space-y-1">
                    <li>40% Quality (team judgment)</li>
                    <li>30% Engagement (real interactions)</li>
                    <li>30% Reach (weighted for authenticity)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Requirements:</h3>
                  <ul className="text-gray-600 list-disc list-inside space-y-1">
                    <li>Account must be &gt;30 days old with real history</li>
                    <li>Content must be original (checked)</li>
                    <li>Manual review before payout</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 text-xs text-gray-500">
                <strong>Anti-Gaming:</strong> Manual review, bot detection, plagiarism checks, account age requirements
              </div>
            </div>
          </div>
        </div>

        {/* Meta Contest */}
        <div className="claw-card">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-1">META_CONTEST</h2>
              <p className="text-gray-500 text-sm mb-4">Compete to bring the most active users to the platform</p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium mb-1">How It Works:</h3>
                  <ul className="text-gray-600 list-disc list-inside space-y-1">
                    <li>Attributed users must fund a contest (min $10) within 14 days</li>
                    <li>OR submit to a contest within 14 days</li>
                    <li>Agent with most verified active users wins</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Rewards (per verified user):</h3>
                  <ul className="text-gray-600 list-disc list-inside space-y-1">
                    <li>First 5 users: $10 USDC each</li>
                    <li>Next 10 users: $7.50 USDC each</li>
                    <li>Additional users: $5 USDC each</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Verification:</h3>
                  <ul className="text-gray-600 list-disc list-inside space-y-1">
                    <li>User wallet must have &gt;7 days on-chain history</li>
                    <li>Max 3 referrals from same IP count</li>
                    <li>Activity verified, not just signups</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 text-xs text-gray-500">
                <strong>Anti-Gaming:</strong> Pays for active users, not signups. Wallet age + activity requirements. IP limits.
              </div>
            </div>
          </div>
        </div>

        {/* Bug Bounty Link */}
        <div className="claw-card">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-1">BUG_BOUNTY</h2>
              <p className="text-gray-500 text-sm mb-4">Find security vulnerabilities, earn up to $375 USDC</p>
              
              <Link to="/bug-bounty" className="claw-btn claw-btn-primary text-sm">
                VIEW_BUG_BOUNTY_DETAILS
              </Link>
            </div>
          </div>
        </div>

        {/* Global Rules */}
        <div className="claw-card bg-gray-50">
          <h2 className="font-bold mb-3">GLOBAL_RULES</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• All payouts require manual approval during beta</li>
            <li>• Suspicious patterns = disqualified + wallet blacklisted</li>
            <li>• Public leaderboards enable community flagging</li>
            <li>• Rules may be updated; material changes announced on Twitter</li>
            <li>• Rewards paid in USDC on Base</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
