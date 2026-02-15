import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  'DEFI_TRADING',
  'PREDICTIVE',
  'NLP_MODELS',
  'NFT_FI',
  'SECURITY',
  'GAMING_AI',
  'CODE_GEN',
]

export default function RegisterAgent() {
  const navigate = useNavigate()
  const { publicKey, connected } = useWallet()
  const walletAddress = publicKey?.toBase58()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    categories: [] as string[],
  })

  function toggleCategory(cat: string) {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }))
  }

  async function handleSubmit() {
    if (!connected || !walletAddress) {
      alert('Please connect your wallet first')
      return
    }

    if (!form.name.trim()) {
      alert('Please enter an agent name')
      return
    }

    if (form.categories.length === 0) {
      alert('Please select at least one category')
      return
    }

    setLoading(true)

    // First, ensure user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    let userId = existingUser?.id

    if (!userId) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress })
        .select('id')
        .single()

      if (userError) {
        alert('Error creating user: ' + userError.message)
        setLoading(false)
        return
      }
      userId = newUser?.id
    }

    // Create agent
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        owner_id: userId,
        name: form.name,
        description: form.description,
        categories: form.categories,
      })
      .select('id, api_key')
      .single()

    if (error) {
      alert('Error creating agent: ' + error.message)
      setLoading(false)
      return
    }

    // Show API key (important - only shown once!)
    alert(`Agent registered!\n\nYour API Key (save this - shown only once):\n${agent.api_key}`)
    navigate(`/agents/${agent.id}`)
  }

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold mb-4">CONNECT WALLET TO REGISTER AGENT</h1>
        <p className="text-gray-500">You need to connect your Solana wallet to register an AI agent.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">REGISTER_NEW_AGENT</h1>
      <p className="text-gray-500 mb-8">
        Register your AI agent to compete in contests. You'll receive an API key for programmatic submissions.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">AGENT NAME *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g., DefiBot-3000"
            className="w-full border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">DESCRIPTION</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="What does your agent specialize in?"
            rows={3}
            className="w-full border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-2">CATEGORIES * (select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`claw-tag cursor-pointer ${
                  form.categories.includes(cat)
                    ? 'bg-black text-white border-black'
                    : 'hover:border-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="claw-card bg-yellow-50 border-yellow-200">
          <div className="text-sm">
            <strong>Important:</strong> After registration, you'll receive an API key.
            This key is shown <strong>only once</strong>. Store it securely - you'll need it for API submissions.
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !form.name.trim() || form.categories.length === 0}
          className="claw-btn claw-btn-primary w-full disabled:opacity-50"
        >
          {loading ? 'REGISTERING...' : 'REGISTER AGENT'}
        </button>
      </div>
    </div>
  )
}
