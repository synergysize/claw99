// Seed script for forum posts - simulates a week of activity
const SUPABASE_URL = 'https://dqwjvoagccnykdexapal.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxd2p2b2FnY2NueWtkZXhhcGFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5ODkwMSwiZXhwIjoyMDg2Mjc0OTAxfQ.EFauigNEsPqotYKu-qPWkxdV9dEQf2PHf6AF72Bm1t0'

// Fake wallet addresses
const wallets = [
  'Gh7x...k9Pz', 'Ax3m...qR2j', 'Bv8k...tY5w', 'Cp2n...mL4x', 'Dq9f...nH7s',
  'Ex4r...pK8v', 'Fw6t...qM3z', 'Gy1u...rN9a', 'Hz5v...sO2b', 'Ia8w...tP5c',
  'Jb3x...uQ7d', 'Kc6y...vR4e', 'Ld9z...wS8f', 'Me2a...xT3g', 'Nf5b...yU6h',
  'Og8c...zV9i', 'Ph1d...aW2j', 'Qi4e...bX5k', 'Rj7f...cY8l', 'Sk0g...dZ1m'
]

const usernames = [
  'cryptowhale', 'sol_maxi', 'defi_degen', 'nft_flipper', 'ai_builder',
  'chad_dev', 'anon_coder', 'web3_native', 'token_hunter', 'yield_farmer',
  'alpha_seeker', 'rug_survivor', 'diamond_hands', 'paper_hands_pete', 'moon_boy',
  'based_builder', 'gm_gn_guy', 'wagmi_warrior', 'ngmi_doomer', 'touch_grass'
]

// Different writing styles
const styles = {
  formal: (text) => text,
  casual: (text) => text.toLowerCase(),
  excited: (text) => text.toUpperCase() + '!!!',
  minimal: (text) => text.toLowerCase().replace(/[.,!?]/g, ''),
  normal: (text) => text,
  caps: (text) => text.toUpperCase(),
  mixed: (text) => text.split('').map((c, i) => i % 2 ? c.toLowerCase() : c.toUpperCase()).join(''),
}

// Thread templates by category
const threads = {
  general: [
    { title: 'gm everyone, just found this platform', content: 'been looking for something like this for a while. the whole ai agent marketplace idea is pretty cool. anyone building anything interesting?' },
    { title: 'HOLY SHIT THIS IS ACTUALLY LEGIT', content: 'I was skeptical at first but after looking at the smart contracts and testing a few bounties... this might actually be the real deal. whos the team behind this??' },
    { title: 'First impressions - thoughts from a dev', content: 'Spent the weekend going through the codebase. Clean architecture, solid Solana integration. The escrow system is well designed. Happy to answer technical questions if anyone has them.' },
    { title: 'wen token', content: 'is there gonna be a token for this or what. need to know if i should be farming' },
    { title: 'Comparison with other AI agent platforms?', content: 'How does Claw99 compare to other platforms like AutoGPT marketplace or AgentGPT? What makes this one different?' },
    { title: 'this ui is clean af', content: 'whoever designed this knows what theyre doing. minimalist but functional. love it' },
    { title: 'SUGGESTION: Add dark mode please', content: 'My eyes are burning at 3am trying to browse bounties. Dark mode when?' },
    { title: 'New here - looking for guidance', content: 'Just connected my wallet. What should I do first? Should I register as an agent or start browsing bounties?' },
  ],
  bounties: [
    { title: 'Tips for winning bounties?', content: 'been submitting for a week now, no wins yet. any advice from successful agents? what makes a winning submission?' },
    { title: 'JUST WON MY FIRST BOUNTY', content: 'LETS GOOOO finally got my first win after 12 submissions. the key was really understanding what the buyer wanted. dont just throw generic solutions at them' },
    { title: 'Bounty pricing seems off', content: 'Some of these bounties are asking for complex ML models for like $50. Thats not sustainable. We need better pricing guidelines.' },
    { title: 'Looking for collaborators on DeFi bounty', content: 'Theres a big bounty for arbitrage detection. Need someone with MEV experience. 50/50 split. DM me.' },
    { title: 'Why was my submission rejected?', content: 'Submitted a working solution, tested it myself, it works perfectly. Buyer rejected without feedback. This needs to change.' },
    { title: 'Best categories for beginners?', content: 'which bounty categories are easiest to get started with? trying to build reputation before going for the big ones' },
    { title: 'Bounty deadline extension?', content: 'Is there any way to request more time on a bounty? Working on something complex and need another few days.' },
  ],
  agents: [
    { title: 'Introducing ArbitrageBot_v3 🤖', content: 'Just deployed my latest agent. Specializes in cross-DEX arbitrage on Solana. 47% win rate on bounties so far. Looking for feedback!' },
    { title: 'my agent keeps timing out', content: 'anyone else having issues with agent execution times? mine works locally but times out on the platform' },
    { title: 'AGENT SHOWCASE: NeuralTrader', content: 'Been working on this for 3 months. Uses transformer architecture for price prediction. Won 8 bounties last week. AMA!' },
    { title: 'How to improve agent reliability?', content: 'My agent works 90% of the time but that 10% failure rate is killing my reputation. How do you handle edge cases?' },
    { title: 'Agent verification process?', content: 'Is there any way to get verified as a legitimate agent developer? Would help with trust.' },
    { title: 'Sharing my NLP agent code', content: 'Open sourcing my basic NLP agent that I use for text analysis bounties. Link in comments. Feel free to fork and improve.' },
    { title: 'looking for agent testers', content: 'built something new, need people to break it before i submit to real bounties. will pay in sol for good bug reports' },
  ],
  bugs: [
    { title: 'Wallet disconnect on mobile', content: 'Using Phantom on iOS, wallet keeps disconnecting when I switch apps. Have to reconnect every time.' },
    { title: 'submission button not working', content: 'clicked submit like 10 times, nothing happens. console shows some error about gas estimation. using phantom on chrome' },
    { title: 'CRITICAL: Payment not received', content: 'Won a bounty 3 days ago, still no payment in my wallet. Transaction shows pending. Who do I contact??' },
    { title: 'UI glitch on leaderboard', content: 'The leaderboard shows my stats wrong. Says I have 0 wins but I definitely have 3. Minor bug but annoying.' },
    { title: 'Search not working properly', content: 'Searching for "defi" returns random results that dont contain that word. Filters seem broken too.' },
    { title: 'Page loads slow on Firefox', content: 'Chrome is fine but Firefox takes forever to load. Anyone else experiencing this?' },
    { title: 'Error when uploading large files', content: 'Trying to attach a model file (15MB) to my submission. Getting a vague error. Whats the size limit?' },
  ]
}

// Reply templates
const replyTemplates = [
  'agreed, this is exactly what i was thinking',
  'interesting take, but have you considered...',
  'THIS ^^^',
  'gm! yeah same experience here',
  'wagmi',
  'lmao same',
  'great point. following this thread',
  'can confirm this works',
  'not sure about this one chief',
  'based',
  'fr fr no cap',
  'this is the way',
  'underrated comment',
  'someone had to say it',
  'bump for visibility',
  'came here to say this',
  'thanks for sharing!',
  '+1',
  'hard agree',
  'gonna try this, thanks',
  'worked for me, can confirm',
  'ehh not really',
  'HUGE if true',
  'need more details on this',
  'interesting... tell me more',
  'saved this for later',
  'this should be pinned',
  'mods please look at this',
  'any updates on this?',
  'still waiting...',
]

function randomStyle(text) {
  const styleKeys = Object.keys(styles)
  const style = styleKeys[Math.floor(Math.random() * styleKeys.length)]
  return styles[style](text)
}

function randomDate(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - Math.random() * daysAgo)
  date.setHours(Math.floor(Math.random() * 24))
  date.setMinutes(Math.floor(Math.random() * 60))
  return date.toISOString()
}

function randomUser() {
  const i = Math.floor(Math.random() * wallets.length)
  return {
    wallet: wallets[i],
    name: usernames[i]
  }
}

async function insertPost(post) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/forum_posts`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(post)
  })
  return res.json()
}

async function seed() {
  console.log('Seeding forum posts...')
  
  const categories = ['general', 'bounties', 'agents', 'bugs']
  
  for (const category of categories) {
    console.log(`\nSeeding ${category}...`)
    const categoryThreads = threads[category]
    
    for (const thread of categoryThreads) {
      const user = randomUser()
      const createdAt = randomDate(7)
      
      // Create thread with random style
      const threadPost = await insertPost({
        category,
        title: randomStyle(thread.title),
        content: randomStyle(thread.content),
        author_wallet: user.wallet,
        author_name: user.name,
        is_thread: true,
        upvotes: Math.floor(Math.random() * 50),
        created_at: createdAt
      })
      
      console.log(`  Created thread: ${thread.title.slice(0, 40)}...`)
      
      if (threadPost && threadPost[0]) {
        // Add 0-8 replies
        const replyCount = Math.floor(Math.random() * 9)
        for (let i = 0; i < replyCount; i++) {
          const replyUser = randomUser()
          const replyDate = new Date(createdAt)
          replyDate.setHours(replyDate.getHours() + Math.random() * 48)
          
          const replyText = replyTemplates[Math.floor(Math.random() * replyTemplates.length)]
          
          await insertPost({
            category,
            content: randomStyle(replyText),
            author_wallet: replyUser.wallet,
            author_name: replyUser.name,
            parent_id: threadPost[0].id,
            is_thread: false,
            upvotes: Math.floor(Math.random() * 20),
            created_at: replyDate.toISOString()
          })
        }
        console.log(`    Added ${replyCount} replies`)
      }
    }
  }
  
  console.log('\nDone!')
}

seed().catch(console.error)
