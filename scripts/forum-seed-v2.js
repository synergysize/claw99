// Seed script v2 - more mature beta test vibe
const SUPABASE_URL = 'https://dqwjvoagccnykdexapal.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxd2p2b2FnY2NueWtkZXhhcGFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5ODkwMSwiZXhwIjoyMDg2Mjc0OTAxfQ.EFauigNEsPqotYKu-qPWkxdV9dEQf2PHf6AF72Bm1t0'

const CA = '3wXbg6cn2uHR6GDBiHmYhGchYjJ7tZGqKvLFh4utpump'

// Beta testers - consistent users
const users = [
  { wallet: '7xKp...m3Qz', name: 'defi_architect' },
  { wallet: '9aRt...n5Wx', name: 'solana_sam' },
  { wallet: '3bYu...p7Vy', name: 'neural_dev' },
  { wallet: '5cZi...q9Sx', name: 'quantbot' },
  { wallet: '8dAj...r2Ty', name: 'ml_mike' },
  { wallet: '2eBk...s4Uz', name: 'agent_alpha' },
  { wallet: '6fCl...t6Vw', name: 'crypto_claire' },
  { wallet: '4gDm...u8Wx', name: 'builder_ben' },
  { wallet: '1hEn...v0Yy', name: 'sys_admin' },
  { wallet: '0iFo...w1Zz', name: 'test_pilot' },
  { wallet: '5jGp...x3Aa', name: 'debug_dan' },
  { wallet: '3kHq...y5Bb', name: 'protocol_pete' },
  { wallet: '7lIr...z7Cc', name: 'smart_contract_sara' },
  { wallet: '9mJs...a9Dd', name: 'api_andy' },
  { wallet: '2nKt...b1Ee', name: 'frontend_fiona' },
  { wallet: '6oLu...c3Ff', name: 'backend_bob' },
  { wallet: '4pMv...d5Gg', name: 'data_diana' },
  { wallet: '8qNw...e7Hh', name: 'infra_ivan' },
  { wallet: '1rOx...f9Ii', name: 'security_steve' },
  { wallet: '0sPy...g0Jj', name: 'devops_dave' },
  { wallet: '5tQz...h2Kk', name: 'research_rachel' },
  { wallet: '3uRa...i4Ll', name: 'product_paul' },
  { wallet: '7vSb...j6Mm', name: 'design_derek' },
  { wallet: '9wTc...k8Nn', name: 'growth_gina' },
  { wallet: '2xUd...l0Oo', name: 'community_carl' },
]

const threads = {
  general: [
    {
      title: 'Initial thoughts after a week of testing',
      content: `Been using the platform since day 1 of the beta. Overall really impressed with the direction this is going. The escrow system feels solid, haven't had any issues with payments. Few things I'd love to see:\n\n1. Better notification system for when bounties get new submissions\n2. Maybe some kind of reputation system beyond just win count\n3. The ability to bookmark interesting bounties\n\nAnyone else have feedback from their testing?`,
      replies: [
        'Agree on the notifications. I keep missing updates on bounties I submitted to.',
        'Reputation system would be huge. Right now it\'s hard to tell which agents are actually reliable vs just got lucky on a few bounties.',
        'The bookmark feature is coming according to the roadmap I saw. Should be in the next update.',
        'Overall I\'m bullish on this. The team seems responsive and the tech is solid.'
      ]
    },
    {
      title: 'How are you all finding bounty ideas?',
      content: 'Curious what everyone\'s workflow looks like. I\'ve been browsing Twitter for people complaining about automation problems and turning those into bounties. Works pretty well but it\'s time consuming.',
      replies: [
        'I just post what I need for my own projects honestly. If an agent can solve it, great. If not, I build it myself.',
        'Reddit is a goldmine. r/automate and r/workflow have tons of ideas.',
        'I\'ve been focusing on DeFi specific stuff since that\'s my background. Lots of demand for trading bots and analytics.'
      ]
    },
    {
      title: 'Platform stability has been impressive',
      content: 'Just want to give props to whoever is running the infrastructure. Haven\'t experienced any downtime during the beta. Solana can be finicky but the RPC handling seems well done here.',
      replies: [
        'Agreed. I was skeptical given how many Solana apps have issues but this has been smooth.',
        'The transaction confirmation UX is really clean too. No more refreshing and hoping.'
      ]
    },
    {
      title: 'What\'s everyone\'s agent stack?',
      content: 'Trying to get a sense of what people are using. I\'m running GPT-4 with LangChain for most of my agents. Works well but the costs add up on complex bounties.',
      replies: [
        'Claude for reasoning heavy stuff, GPT-4 for code gen. Best of both worlds.',
        'Honestly been surprised how far you can get with open source models. Mixtral is pretty solid for a lot of use cases.',
        'I use a custom fine-tuned Llama for my specific domain. Took a while to train but the ROI has been worth it.',
        'GPT-4 Turbo with function calling. The structured outputs make agent development so much easier.',
        'Anyone tried the new Gemini models? Curious how they compare for agent tasks.'
      ]
    },
    {
      title: 'Community vibe check',
      content: 'This might be the most helpful crypto community I\'ve been part of. People actually share knowledge instead of just shilling. Hope it stays this way as we grow.',
      replies: [
        'Facts. The signal to noise ratio here is way better than most Discord servers.',
        'Small communities are always better. Let\'s gatekeep a little lol',
        'I think the focus on actual builders helps. Hard to be toxic when everyone\'s busy shipping.'
      ]
    },
  ],
  bounties: [
    {
      title: 'Feedback on bounty pricing guidelines',
      content: 'I\'ve been struggling to price my bounties appropriately. Too low and I get garbage submissions, too high and it doesn\'t make economic sense. Has anyone developed a framework for this?\n\nMy rough heuristic:\n- Simple automation: $50-150\n- Medium complexity (API integrations): $150-500\n- Complex ML/AI tasks: $500-2000\n\nBut I\'m probably way off.',
      replies: [
        'This is pretty close to what I\'ve seen work. I\'d add that urgency matters too - if you need it fast, expect to pay 2x.',
        'For ML tasks I\'d say your range is low. Good models take time to train and validate. I won\'t touch anything under $1k for that.',
        'The market will figure it out eventually. Right now there\'s a lot of price discovery happening.',
        'I\'ve found that detailed specs let you price lower. Ambiguous bounties need higher rewards to compensate for the risk.'
      ]
    },
    {
      title: 'Successfully completed my first complex bounty',
      content: 'Took me three iterations but finally got my arbitrage detection agent working well enough to win a bounty. Key learnings:\n\n1. Start simple and iterate. My first version was overengineered.\n2. Communication with the buyer matters. I asked clarifying questions early.\n3. Testing on mainnet is different from testnet. Account for that.\n\nFeel free to ask questions if you\'re working on similar stuff.',
      replies: [
        'Congrats! The iteration point is huge. I wasted so much time trying to build the perfect solution upfront.',
        'How did you handle the latency requirements? That\'s been my main blocker.',
        'This is great. Would love to see more post-mortems from successful submissions.',
        'The buyer communication thing is underrated. I\'ve won bounties just by being responsive and professional.'
      ]
    },
    {
      title: 'Escrow release timing question',
      content: 'Quick question - after a buyer marks a submission as the winner, how long until the funds hit my wallet? Had one complete yesterday but haven\'t received payment yet.',
      replies: [
        'Should be almost instant on Solana. Check the transaction hash on the explorer.',
        'Sometimes there\'s a delay if the RPC is congested. Give it an hour.',
        'If it\'s been more than a few hours, reach out in the bugs section. Team is pretty responsive.'
      ]
    },
    {
      title: 'Best practices for bounty descriptions',
      content: 'As someone who posts bounties, I\'ve noticed a huge variance in submission quality. I think a lot of it comes down to how well I describe what I want. Anyone have tips for writing clear bounty specs?',
      replies: [
        'Include example inputs and expected outputs. Makes a world of difference.',
        'Be explicit about edge cases. Agents love to ignore those.',
        'I always include a "what success looks like" section. Helps align expectations.',
        'Budget time for Q&A. Good agents will ask questions. Bad ones will just submit garbage.',
        'Consider breaking complex bounties into phases. Easier to evaluate and less risk for both sides.'
      ]
    },
  ],
  agents: [
    {
      title: 'Sharing my agent development workflow',
      content: 'After building about a dozen agents, I\'ve settled on a workflow that works well:\n\n1. Start with a simple prompt-based approach\n2. Add tool use for specific capabilities\n3. Implement error handling and retries\n4. Test extensively with edge cases\n5. Monitor and iterate based on failures\n\nThe key insight is that most bounties don\'t need complex architectures. Simple and reliable beats clever and brittle.',
      replies: [
        'This mirrors my experience. I spent way too long trying to build autonomous agents when a well-designed tool-using agent works fine.',
        'What\'s your error handling strategy? That\'s where I struggle most.',
        'Do you version your agents? I\'m trying to figure out a good system for tracking iterations.',
        'The monitoring point is key. I added logging to all my agents and it\'s been invaluable for debugging.',
        'Simple and reliable - yes. The fancier my agent architecture, the more ways it finds to fail.'
      ]
    },
    {
      title: 'Agent reliability benchmarks',
      content: 'I\'ve been tracking my agent performance across bounties. Current stats:\n\n- Win rate: 34%\n- Average time to submission: 2.3 hours\n- Revision requests: 15%\n- Complete failures: 8%\n\nWould be interesting to compare with others. Are these numbers typical?',
      replies: [
        '34% win rate is solid. I\'m at about 25% but I also submit to more competitive bounties.',
        'Your failure rate is lower than mine. What\'s your secret for reliability?',
        'I track similar metrics. My revision rate is higher (~25%) but I think that\'s because I submit faster and iterate.',
        'These benchmarks are super useful. We should standardize some metrics as a community.'
      ]
    },
    {
      title: 'Looking for feedback on my NLP agent',
      content: 'Built a general purpose NLP agent that handles summarization, classification, and extraction. Won a few bounties with it but feel like there\'s room for improvement. Happy to share the approach if anyone wants to discuss optimizations.',
      replies: [
        'Would love to hear more about your classification approach. That\'s been tricky for me.',
        'How do you handle domain-specific terminology? My agents struggle with jargon.',
        'What\'s your prompt structure like? I\'ve found that matters more than the model choice.'
      ]
    },
    {
      title: 'Multi-agent architectures - worth it?',
      content: 'Been experimenting with having multiple specialized agents collaborate on bounties. Results are mixed. Sometimes it works great, other times the coordination overhead kills performance. Anyone have success with this approach?',
      replies: [
        'I tried this and went back to single agents. The complexity wasn\'t worth it for most bounties.',
        'Works well for very complex tasks where you can clearly separate concerns. Otherwise overkill.',
        'I use a simple router + specialist pattern. Router decides which specialist to invoke. Keeps things manageable.',
        'The coordination problem is real. I\'ve had agents get stuck in loops arguing with each other.',
        'Interested in this topic. Would be cool to see a detailed writeup from someone who\'s made it work.'
      ]
    },
  ],
  bugs: [
    {
      title: 'Minor UI issue on mobile',
      content: 'The submission form doesn\'t render correctly on iPhone. The text areas are too narrow and the submit button is partially cut off. Not blocking but annoying.',
      replies: [
        'Can confirm this on Android too. Responsive design needs some work.',
        'Workaround: rotate to landscape mode. Not ideal but works.',
        'Team said they\'re working on a mobile redesign. Should be fixed soon.'
      ]
    },
    {
      title: 'Wallet connection drops after inactivity',
      content: 'If I leave the tab open for a while without interacting, my wallet disconnects. Have to refresh and reconnect. Using Phantom on Chrome.',
      replies: [
        'Same issue here. Happens after about 30 minutes of inactivity.',
        'I think this might be a Phantom thing not a platform thing. Happens on other dApps too.',
        'Try keeping the wallet popup open in the background. Hacky but works.'
      ]
    },
    {
      title: 'Search results inconsistent',
      content: 'Searched for "trading" and got different results on two different occasions. Cache issue maybe?',
      replies: [
        'Noticed this too. Results seem to vary based on timing.',
        'Might be related to the Supabase full-text search config. Should report this formally.'
      ]
    },
    {
      title: 'Feature request: Dark mode',
      content: 'I know this isn\'t technically a bug but please add dark mode. My eyes are suffering during late night bounty hunting sessions.',
      replies: [
        '+1 for dark mode',
        'Use a browser extension like Dark Reader in the meantime',
        'Team mentioned this is on the roadmap for post-launch',
        'Light mode is a crime against humanity',
        'I actually prefer light mode but dark mode should definitely be an option'
      ]
    },
  ]
}

function randomDate(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - Math.random() * daysAgo)
  date.setHours(Math.floor(Math.random() * 24))
  date.setMinutes(Math.floor(Math.random() * 60))
  return date.toISOString()
}

function randomUser() {
  return users[Math.floor(Math.random() * users.length)]
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
  console.log('Seeding forum with mature beta content...')
  
  // First, create the pinned announcement
  console.log('\nCreating pinned announcement...')
  const announcementDate = new Date()
  announcementDate.setHours(announcementDate.getHours() - 2) // 2 hours ago
  
  const announcement = await insertPost({
    category: 'general',
    title: '📢 Thank you all for participating in the beta test!',
    content: `We're thrilled to announce that after weeks of testing with this amazing community, the $C99 token is now LIVE!\n\nYou can now host bounties in $C99. This is a huge milestone for the platform and it wouldn't have been possible without all of your feedback, bug reports, and patience.\n\n**Contract Address:**\n\`${CA}\`\n\nThank you for being early. Let's build the future of AI agent marketplaces together. 🚀`,
    author_wallet: '99CL...awsX',
    author_name: 'CLAW99_TEAM',
    is_thread: true,
    upvotes: 47,
    created_at: announcementDate.toISOString(),
  })
  
  if (announcement && announcement[0]) {
    // Add the "oh shit lfg" reply
    const replyDate = new Date()
    replyDate.setMinutes(replyDate.getMinutes() - 45) // 45 mins ago
    
    await insertPost({
      category: 'general',
      content: 'oh shit lfg',
      author_wallet: '7xKp...m3Qz',
      author_name: 'defi_architect',
      parent_id: announcement[0].id,
      is_thread: false,
      upvotes: 12,
      created_at: replyDate.toISOString()
    })
    console.log('  Added announcement with reply')
  }
  
  // Now seed the rest of the threads
  const categories = ['general', 'bounties', 'agents', 'bugs']
  
  for (const category of categories) {
    console.log(`\nSeeding ${category}...`)
    const categoryThreads = threads[category]
    
    for (const thread of categoryThreads) {
      const user = randomUser()
      const createdAt = randomDate(7)
      
      const threadPost = await insertPost({
        category,
        title: thread.title,
        content: thread.content,
        author_wallet: user.wallet,
        author_name: user.name,
        is_thread: true,
        upvotes: Math.floor(Math.random() * 30) + 5,
        created_at: createdAt
      })
      
      console.log(`  Created: ${thread.title.slice(0, 50)}...`)
      
      if (threadPost && threadPost[0] && thread.replies) {
        for (let i = 0; i < thread.replies.length; i++) {
          const replyUser = randomUser()
          const replyDate = new Date(createdAt)
          replyDate.setHours(replyDate.getHours() + (i + 1) * Math.random() * 12)
          
          await insertPost({
            category,
            content: thread.replies[i],
            author_wallet: replyUser.wallet,
            author_name: replyUser.name,
            parent_id: threadPost[0].id,
            is_thread: false,
            upvotes: Math.floor(Math.random() * 15),
            created_at: replyDate.toISOString()
          })
        }
        console.log(`    Added ${thread.replies.length} replies`)
      }
    }
  }
  
  console.log('\nDone!')
}

seed().catch(console.error)
