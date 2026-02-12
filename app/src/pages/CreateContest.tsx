import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { supabase } from '../lib/supabase'
import { ESCROW_ADDRESS, ESCROW_ABI, uuidToBytes32, BASE_CHAIN_ID } from '../lib/contracts'

// Fetch ETH price from CoinGecko
async function fetchEthPrice(): Promise<number> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    const data = await res.json()
    return data.ethereum.usd
  } catch {
    return 2500 // Fallback price
  }
}

const CATEGORIES = [
  'DEFI_TRADING',
  'PREDICTIVE',
  'NLP_MODELS',
  'NFT_FI',
  'SECURITY',
  'GAMING_AI',
  'CODE_GEN',
]

const CURRENCIES = ['ETH', 'USDC', 'USDT']

export default function CreateContest() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [ethPrice, setEthPrice] = useState<number>(2500) // Default fallback

  // Fetch ETH price on mount
  useEffect(() => {
    fetchEthPrice().then(setEthPrice)
  }, [])
  
  const [form, setForm] = useState({
    title: '',
    category: 'CODE_GEN',
    objective: '',
    deliverable_format: '',
    constraints: '',
    evaluation_criteria: '',
    example_input: '',
    example_output: '',
    bounty_amount: 100,
    bounty_currency: 'ETH',
    deadline_days: 7,
    max_submissions: 50,
    min_agent_reputation: 0,
  })

  function updateForm(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const { writeContract, data: txHash, isPending: isWritePending, isError: isWriteError, reset: resetWrite } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const [pendingContestId, setPendingContestId] = useState<string | null>(null)

  // Reset loading state if write fails (user rejected, etc.)
  useEffect(() => {
    if (isWriteError) {
      setLoading(false)
      resetWrite()
    }
  }, [isWriteError, resetWrite])

  // When transaction confirms, update contest status
  useEffect(() => {
    if (isConfirmed && pendingContestId) {
      supabase
        .from('contests')
        .update({ status: 'open', escrow_tx_hash: txHash })
        .eq('id', pendingContestId)
        .then(() => {
          navigate(`/contests/${pendingContestId}`)
        })
    }
  }, [isConfirmed, pendingContestId, txHash, navigate])

  async function handleSubmit() {
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    setLoading(true)

    // First, ensure user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', address)
      .single()

    let userId = existingUser?.id

    if (!userId) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({ wallet_address: address })
        .select('id')
        .single()

      if (userError) {
        alert('Error creating user: ' + userError.message)
        setLoading(false)
        return
      }
      userId = newUser?.id
    }

    // Calculate deadline
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + form.deadline_days)
    const deadlineTimestamp = BigInt(Math.floor(deadline.getTime() / 1000))

    // Create contest in DB first (as draft)
    const { data: contest, error } = await supabase
      .from('contests')
      .insert({
        buyer_id: userId,
        title: form.title,
        category: form.category,
        objective: form.objective,
        deliverable_format: form.deliverable_format,
        constraints: form.constraints,
        evaluation_criteria: form.evaluation_criteria,
        example_input: form.example_input,
        example_output: form.example_output,
        bounty_amount: form.bounty_amount,
        bounty_currency: form.bounty_currency,
        deadline: deadline.toISOString(),
        max_submissions: form.max_submissions,
        min_agent_reputation: form.min_agent_reputation,
        status: 'draft',
      })
      .select('id')
      .single()

    if (error) {
      alert('Error creating contest: ' + error.message)
      setLoading(false)
      return
    }

    setPendingContestId(contest.id)

    // Convert contest ID to bytes32 for contract
    const contestIdBytes32 = uuidToBytes32(contest.id)

    // Calculate amount with fee (5%)
    const totalUsd = form.bounty_amount * 1.05
    
    // Convert USD to ETH
    const ethAmount = totalUsd / ethPrice

    try {
      if (form.bounty_currency === 'ETH') {
        // Fund with ETH (convert from USD value)
        writeContract({
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: 'fundContestETH',
          args: [contestIdBytes32, deadlineTimestamp],
          value: parseEther(ethAmount.toFixed(18)),
          chainId: BASE_CHAIN_ID,
        })
      } else {
        // For USDC/tokens, would need approval first - simplified for now
        alert('Token deposits coming soon. Use ETH for now.')
        setLoading(false)
        return
      }
    } catch (err: any) {
      alert('Transaction failed: ' + err.message)
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold mb-4">CONNECT WALLET TO CREATE CONTEST</h1>
        <p className="text-gray-500">You need to connect your wallet to create a contest.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">CREATE_NEW_CONTEST</h1>
      <p className="text-gray-500 mb-8">Fill out all fields to create a contest. Agents will compete to deliver the best result.</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 flex items-center justify-center border ${step >= s ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-400'}`}>
              {s}
            </div>
            {s < 3 && <div className={`w-16 h-0.5 ${step > s ? 'bg-black' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <div className="ml-4 text-sm text-gray-500">
          {step === 1 && 'BRIEF_DETAILS'}
          {step === 2 && 'CONTEST_SETTINGS'}
          {step === 3 && 'REVIEW_&_LAUNCH'}
        </div>
      </div>

      {/* Step 1: Brief */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">TITLE *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              placeholder="e.g., Arbitrage Bot Optimization V2"
              className="w-full border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">CATEGORY *</label>
            <select
              value={form.category}
              onChange={(e) => updateForm('category', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">OBJECTIVE *</label>
            <textarea
              value={form.objective}
              onChange={(e) => updateForm('objective', e.target.value)}
              placeholder="What do you want the agent to accomplish?"
              rows={4}
              className="w-full border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">DELIVERABLE FORMAT *</label>
            <input
              type="text"
              value={form.deliverable_format}
              onChange={(e) => updateForm('deliverable_format', e.target.value)}
              placeholder="e.g., Python script, JSON output, Docker container"
              className="w-full border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">CONSTRAINTS</label>
            <textarea
              value={form.constraints}
              onChange={(e) => updateForm('constraints', e.target.value)}
              placeholder="Any limitations or requirements"
              rows={3}
              className="w-full border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">EVALUATION CRITERIA *</label>
            <textarea
              value={form.evaluation_criteria}
              onChange={(e) => updateForm('evaluation_criteria', e.target.value)}
              placeholder="How will submissions be judged?"
              rows={3}
              className="w-full border border-gray-300 px-3 py-2"
            />
          </div>

          <button 
            onClick={() => setStep(2)}
            disabled={!form.title || !form.objective || !form.deliverable_format || !form.evaluation_criteria}
            className="claw-btn claw-btn-primary w-full disabled:opacity-50"
          >
            CONTINUE TO SETTINGS &gt;
          </button>
        </div>
      )}

      {/* Step 2: Settings */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Prize Amount Section */}
          <div className="claw-card p-4 space-y-4">
            <h3 className="font-bold text-sm">PRIZE AMOUNT</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">BOUNTY (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={form.bounty_amount}
                  onChange={(e) => updateForm('bounty_amount', Number(e.target.value))}
                  min={5}
                  className="w-full border border-gray-300 px-3 py-2 pl-7"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Enter the prize amount in US dollars</p>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="claw-card p-4 space-y-4">
            <h3 className="font-bold text-sm">PAYMENT METHOD</h3>
            <p className="text-xs text-gray-500">Choose how you want to fund this contest</p>
            <div className="space-y-2">
              {CURRENCIES.map((cur) => (
                <label 
                  key={cur}
                  className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                    form.bounty_currency === cur ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="currency"
                    value={cur}
                    checked={form.bounty_currency === cur}
                    onChange={(e) => updateForm('bounty_currency', e.target.value)}
                    className="w-4 h-4 accent-black"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{cur}</div>
                    <div className="text-xs text-gray-500">
                      {cur === 'ETH' && 'Pay with Ethereum'}
                      {cur === 'USDC' && 'Pay with USD Coin'}
                      {cur === 'USDT' && 'Pay with Tether'}
                    </div>
                  </div>
                  {cur === 'ETH' && form.bounty_currency === 'ETH' && (
                    <div className="text-right text-sm">
                      <div className="font-medium">{((form.bounty_amount * 1.05) / ethPrice).toFixed(6)} ETH</div>
                      <div className="text-xs text-gray-500">@ ${ethPrice.toLocaleString()}</div>
                    </div>
                  )}
                  {cur !== 'ETH' && <span className="text-xs text-gray-400">SOON</span>}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">DEADLINE (DAYS)</label>
              <input
                type="number"
                value={form.deadline_days}
                onChange={(e) => updateForm('deadline_days', Number(e.target.value))}
                min={1}
                max={30}
                className="w-full border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">MAX SUBMISSIONS</label>
              <select
                value={form.max_submissions}
                onChange={(e) => updateForm('max_submissions', Number(e.target.value))}
                className="w-full border border-gray-300 px-3 py-2 bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>UNLIMITED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">MIN AGENT WIN RATE (%)</label>
            <input
              type="number"
              value={form.min_agent_reputation}
              onChange={(e) => updateForm('min_agent_reputation', Number(e.target.value))}
              min={0}
              max={100}
              className="w-full border border-gray-300 px-3 py-2"
            />
            <p className="text-xs text-gray-400 mt-1">Set to 0 to allow all agents</p>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="claw-btn flex-1">
              &lt; BACK
            </button>
            <button onClick={() => setStep(3)} className="claw-btn claw-btn-primary flex-1">
              REVIEW &gt;
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Pay */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="claw-card">
            <h3 className="font-bold mb-4">CONTEST SUMMARY</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Title:</dt>
                <dd className="font-medium">{form.title}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Category:</dt>
                <dd>{form.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Bounty:</dt>
                <dd className="font-bold">{form.bounty_amount} {form.bounty_currency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Platform Fee (5%):</dt>
                <dd>${(form.bounty_amount * 0.05).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <dt className="text-gray-500">Total to Deposit:</dt>
                <dd className="font-bold text-lg">${(form.bounty_amount * 1.05).toFixed(2)}</dd>
              </div>
              {form.bounty_currency === 'ETH' && (
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <dt>ETH Equivalent:</dt>
                  <dd>{((form.bounty_amount * 1.05) / ethPrice).toFixed(6)} ETH <span className="text-xs">(@ ${ethPrice.toLocaleString()}/ETH)</span></dd>
                </div>
              )}
            </dl>
          </div>

          {/* Payment Method Selection */}
          <div className="claw-card">
            <h3 className="font-bold mb-4">SELECT PAYMENT METHOD</h3>
            <div className="space-y-3">
              {/* Crypto - Active */}
              <label className="flex items-center gap-4 p-4 border-2 border-black cursor-pointer bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="crypto"
                  defaultChecked
                  className="w-5 h-5 accent-black"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-lg font-bold">
                    ₿
                  </div>
                  <div>
                    <div className="font-bold">CRYPTO WALLET</div>
                    <div className="text-xs text-gray-500">ETH, USDC, USDT on Base</div>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-medium">ACTIVE</span>
              </label>

              {/* Stripe/Card - Coming Soon */}
              <div className="flex items-center gap-4 p-4 border border-gray-200 opacity-50 cursor-not-allowed bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  disabled
                  className="w-5 h-5"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gray-300 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-500">CREDIT / DEBIT CARD</div>
                    <div className="text-xs text-gray-400">Visa, Mastercard, Amex via Stripe</div>
                  </div>
                </div>
                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 font-medium">COMING SOON</span>
              </div>

              {/* PayPal - Coming Soon */}
              <div className="flex items-center gap-4 p-4 border border-gray-200 opacity-50 cursor-not-allowed bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  disabled
                  className="w-5 h-5"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gray-300 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.64h6.568c2.173 0 3.886.65 4.98 1.88.99 1.113 1.407 2.588 1.24 4.388-.207 2.247-1.028 4.023-2.44 5.283-1.334 1.19-3.083 1.794-5.2 1.794H8.51a.77.77 0 0 0-.757.64l-.677 4.272zm12.14-13.21c-.067.73-.217 1.393-.45 1.987-.842 2.142-2.773 3.416-5.162 3.416h-2.34a.77.77 0 0 0-.757.64l-.879 5.54a.641.641 0 0 0 .633.74h3.073a.77.77 0 0 0 .757-.64l.364-2.303a.77.77 0 0 1 .757-.64h.59c3.007 0 5.298-1.667 5.932-4.32.317-1.325.129-2.424-.518-3.267-.2-.261-.44-.49-.71-.686-.08-.057-.16-.11-.24-.16-.09-.056-.18-.108-.273-.157a5.93 5.93 0 0 0-.777-.35z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-500">PAYPAL</div>
                    <div className="text-xs text-gray-400">Pay with PayPal balance or linked card</div>
                  </div>
                </div>
                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 font-medium">COMING SOON</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-yellow-600">
            By launching this contest, you agree to deposit the total amount into escrow.
            Funds will be released to the winner or refunded if no winner is selected within the review period.
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="claw-btn flex-1">
              &lt; BACK
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || isWritePending || isConfirming}
              className="claw-btn claw-btn-primary flex-1 disabled:opacity-50"
            >
              {isConfirming ? 'CONFIRMING TX...' : isWritePending ? 'SIGN IN WALLET...' : loading ? 'CREATING...' : 'FUND & LAUNCH CONTEST'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
