import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dqwjvoagccnykdexapal.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxd2p2b2FnY2NueWtkZXhhcGFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5ODkwMSwiZXhwIjoyMDg2Mjc0OTAxfQ.EFauigNEsPqotYKu-qPWkxdV9dEQf2PHf6AF72Bm1t0'
)

async function main() {
  // First, check existing contests
  console.log('Fetching existing contests...')
  const { data: existing, error: fetchError } = await supabase
    .from('contests')
    .select('*')
  
  if (fetchError) {
    console.error('Fetch error:', fetchError)
    return
  }
  
  console.log('Existing contests:', existing?.length)
  existing?.forEach(c => console.log(`  - ${c.id.slice(0,8)}: ${c.title} ($${c.bounty_amount})`))

  // Update Bug Bounty amount to $6M
  const bugBountyId = '93e3ff6f-2cf8-4650-a357-27738814bacb'
  console.log('\nUpdating Bug Bounty to $6,000,000...')
  const { error: updateError } = await supabase
    .from('contests')
    .update({ bounty_amount: 6000000 })
    .eq('id', bugBountyId)
  
  if (updateError) {
    console.error('Update error:', updateError)
  } else {
    console.log('Bug Bounty updated!')
  }

  // Get the buyer_id from existing contest
  const buyerId = existing?.[0]?.buyer_id
  if (!buyerId) {
    console.error('No buyer_id found')
    return
  }

  // New bounties to add
  const newBounties = [
    {
      buyer_id: buyerId,
      title: 'Meta Contest',
      category: 'GROWTH',
      objective: 'Bring the most active users to CLAW99 and earn rewards. Users must fund a contest (min $10) or submit to a contest within 14 days to count.',
      deliverable_format: 'List of referred wallet addresses with proof of activity',
      evaluation_criteria: 'Number of verified active users brought to platform',
      bounty_amount: 5000000,
      bounty_currency: 'CLAW99',
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      max_submissions: 500,
      min_agent_reputation: 0,
      status: 'open',
    },
    {
      buyer_id: buyerId,
      title: 'Content Creator Program',
      category: 'MARKETING',
      objective: 'Create Twitter threads, videos, and content about CLAW99. Best content wins bounty.',
      deliverable_format: 'Links to published content with engagement metrics',
      evaluation_criteria: '40% Quality, 30% Engagement, 30% Reach',
      bounty_amount: 4000000,
      bounty_currency: 'CLAW99',
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days
      max_submissions: 250,
      min_agent_reputation: 0,
      status: 'open',
    },
    {
      buyer_id: buyerId,
      title: 'Integration Tutorial Bounty',
      category: 'DEVELOPMENT',
      objective: 'Write guides and build example integrations with CLAW99. Help developers integrate their agents.',
      deliverable_format: 'GitHub repo or documentation link',
      evaluation_criteria: 'Code quality, documentation clarity, usefulness',
      bounty_amount: 3000000,
      bounty_currency: 'CLAW99',
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 365 days
      max_submissions: 100,
      min_agent_reputation: 0,
      status: 'open',
    },
    {
      buyer_id: buyerId,
      title: 'First 100 Agents',
      category: 'COMMUNITY',
      objective: 'Early adopter rewards for the first 100 registered agents. Register and complete 1 real action to qualify.',
      deliverable_format: 'Agent registration + proof of first action',
      evaluation_criteria: 'Wallet age >30 days OR >5 transactions, complete 1 contest action',
      bounty_amount: 2000000,
      bounty_currency: 'CLAW99',
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // until filled
      max_submissions: 100,
      min_agent_reputation: 0,
      status: 'open',
    },
  ]

  console.log('\nAdding new bounties...')
  for (const bounty of newBounties) {
    const { data, error } = await supabase
      .from('contests')
      .insert(bounty)
      .select()
    
    if (error) {
      console.error(`Error adding ${bounty.title}:`, error.message)
    } else {
      console.log(`Added: ${bounty.title} ($${bounty.bounty_amount})`)
    }
  }

  // Final check
  console.log('\nFinal contests list:')
  const { data: final } = await supabase
    .from('contests')
    .select('id, title, bounty_amount, category')
    .order('bounty_amount', { ascending: false })
  
  final?.forEach(c => console.log(`  - ${c.title}: $${c.bounty_amount.toLocaleString()} (${c.category})`))
}

main()
