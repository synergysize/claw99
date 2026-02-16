/**
 * CLAW99 Theater System
 * Creates realistic-looking activity for launch
 * 
 * Commands:
 *   node theater.js seed          - Create fake users and agents
 *   node theater.js create        - Create a new contest from templates
 *   node theater.js tick          - Process all active contests (add subs, close expired)
 *   node theater.js status        - Show current theater state
 *   node theater.js clear         - Remove all theater data (DANGEROUS)
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const config = require('./config.json');

// Load env from parent
require('dotenv').config({ path: '../../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in app/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

// Generate random Solana wallet address (base58)
function randomWallet() {
  const bs58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += bs58chars[Math.floor(Math.random() * bs58chars.length)];
  }
  return result;
}

// Generate random UUID
function uuid() {
  return crypto.randomUUID();
}

// Random int between min and max (inclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random element from array
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Weighted random selection
function weightedPick(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (const [key, weight] of Object.entries(weights)) {
    rand -= weight;
    if (rand <= 0) return key;
  }
  return Object.keys(weights)[0];
}

// Apply title style variation
function styleTitle(title, style) {
  switch (style) {
    case 'ALL_CAPS':
      return title.toUpperCase();
    case 'lowercase':
      return title.toLowerCase();
    case 'Title Case':
      return title; // Already title case
    case 'no_punctuation':
      return title.replace(/[^\w\s]/g, '');
    case 'abbreviated':
      // Shorten some words
      return title
        .replace(/Analyzer/g, 'Anlyzr')
        .replace(/Generator/g, 'Gen')
        .replace(/Automated/g, 'Auto')
        .replace(/Monitor/g, 'Mon')
        .replace(/Predictor/g, 'Pred');
    default:
      return title;
  }
}

// Seed fake users and agents
async function seed() {
  console.log('🎭 Seeding theater actors...\n');

  // Create fake users
  const users = [];
  for (let i = 0; i < config.fakeAgents.length; i++) {
    const wallet = randomWallet();
    users.push({
      id: uuid(),
      wallet_address: wallet,
      twitter_handle: null,
      is_theater: true  // Mark as theater for easy cleanup
    });
  }

  const { error: userErr } = await supabase.from('users').insert(users);
  if (userErr) {
    console.error('Error creating users:', userErr.message);
    return;
  }
  console.log(`✓ Created ${users.length} fake users`);

  // Create fake agents
  const agents = [];
  for (let i = 0; i < config.fakeAgents.length; i++) {
    const agentConfig = config.fakeAgents[i];
    agents.push({
      id: uuid(),
      owner_id: users[i].id,
      name: agentConfig.name,
      description: `AI agent specializing in ${agentConfig.categories.join(' and ')}`,
      categories: agentConfig.categories,
      api_key: 'theater_' + crypto.randomBytes(16).toString('hex'),
      contests_entered: randInt(5, 50),
      contests_won: randInt(1, 15),
      total_earnings: randInt(10000, 500000),
      current_streak: randInt(0, 5),
      best_streak: randInt(3, 12),
      is_active: true,
      is_theater: true
    });
  }

  const { error: agentErr } = await supabase.from('agents').insert(agents);
  if (agentErr) {
    console.error('Error creating agents:', agentErr.message);
    return;
  }
  console.log(`✓ Created ${agents.length} fake agents`);

  // Also create a buyer user for contests
  const buyerUser = {
    id: uuid(),
    wallet_address: config.ownerWallets[0],
    twitter_handle: 'claw99_official',
    is_theater: true
  };
  
  const { error: buyerErr } = await supabase.from('users').upsert(buyerUser, { 
    onConflict: 'wallet_address' 
  });
  if (buyerErr && !buyerErr.message.includes('duplicate')) {
    console.error('Error creating buyer:', buyerErr.message);
  } else {
    console.log(`✓ Created/updated buyer user`);
  }

  console.log('\n🎭 Theater seeded successfully!');
}

// Create a new contest
async function createContest() {
  console.log('🎬 Creating new contest...\n');

  // Get buyer user
  const { data: buyer } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', config.ownerWallets[0])
    .single();

  if (!buyer) {
    console.error('Buyer not found. Run "seed" first.');
    return;
  }

  const template = pick(config.contestTemplates);
  const durationHours = randInt(template.durationRange[0], template.durationRange[1]);
  const deadline = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  const fillRate = pick(['fast', 'medium', 'slow']);
  
  // Pick currency with weighted randomness
  const currency = weightedPick(config.currencyWeights || { CLAW: 100 });
  
  // Scale bounty based on currency - realistic range $10 - $5,000
  let bounty;
  if (currency === 'SOL') {
    // $10-$5000 at ~$150/SOL = 0.07 - 33 SOL
    bounty = (randInt(7, 3300) / 100); // 0.07 - 33 SOL
    bounty = Math.round(bounty * 100) / 100; // 2 decimals
  } else if (currency === 'USDC' || currency === 'USDT') {
    bounty = randInt(10, 5000); // $10 - $5,000
  } else {
    // CLAW - at $1M MC: $10 = 10K CLAW, $5000 = 5M CLAW
    bounty = randInt(10000, 5000000);
  }
  
  // Apply random title style
  const titleStyle = pick(config.titleStyles || ['normal']);
  const styledTitle = styleTitle(template.title, titleStyle);

  const contest = {
    id: uuid(),
    buyer_id: buyer.id,
    title: styledTitle,
    category: template.category,
    objective: template.objective,
    constraints: template.constraints,
    evaluation_criteria: template.evaluation_criteria,
    deliverable_format: template.deliverable_format,
    bounty_amount: bounty,
    bounty_currency: currency,
    deadline: deadline.toISOString(),
    max_submissions: randInt(10, 50),
    min_agent_reputation: 0,
    status: 'open',
    is_theater: true,
    theater_fill_rate: fillRate,
    theater_next_sub: Date.now() + randInt(60, 600) * 1000
  };

  const { error } = await supabase.from('contests').insert(contest);
  if (error) {
    console.error('Error creating contest:', error.message);
    return;
  }

  console.log(`✓ Created: "${styledTitle}"`);
  console.log(`  Bounty: ${bounty.toLocaleString()} ${currency}`);
  console.log(`  Duration: ${durationHours}h`);
  console.log(`  Fill rate: ${fillRate}`);
  console.log(`  Style: ${titleStyle}`);
}

// Process tick - add submissions, close expired contests
async function tick() {
  console.log('⏰ Processing tick...\n');

  const now = Date.now();

  // Get active theater contests
  const { data: contests } = await supabase
    .from('contests')
    .select('*')
    .eq('is_theater', true)
    .eq('status', 'open');

  if (!contests || contests.length === 0) {
    console.log('No active theater contests');
    return;
  }

  // Get theater agents
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .eq('is_theater', true);

  if (!agents || agents.length === 0) {
    console.log('No theater agents. Run "seed" first.');
    return;
  }

  for (const contest of contests) {
    const deadline = new Date(contest.deadline).getTime();

    // Check if expired
    if (now >= deadline) {
      await closeContest(contest, agents);
      continue;
    }

    // Check if should add submission
    const nextSub = contest.theater_next_sub || 0;
    if (now >= nextSub) {
      await addSubmission(contest, agents);
    }
  }

  console.log('\n✓ Tick complete');
}

// Add a submission to a contest
async function addSubmission(contest, agents) {
  // Get current submission count
  const { count } = await supabase
    .from('submissions')
    .select('id', { count: 'exact' })
    .eq('contest_id', contest.id);

  if (count >= contest.max_submissions) {
    console.log(`  ${contest.title.slice(0, 30)}... - FULL`);
    return;
  }

  // Get agents that match contest category and haven't submitted
  const { data: existingSubs } = await supabase
    .from('submissions')
    .select('agent_id')
    .eq('contest_id', contest.id);

  const submittedAgentIds = new Set((existingSubs || []).map(s => s.agent_id));
  const eligibleAgents = agents.filter(a => 
    a.categories.includes(contest.category) && 
    !submittedAgentIds.has(a.id)
  );

  if (eligibleAgents.length === 0) {
    // Use any agent that hasn't submitted
    const anyEligible = agents.filter(a => !submittedAgentIds.has(a.id));
    if (anyEligible.length === 0) {
      console.log(`  ${contest.title.slice(0, 30)}... - No more agents`);
      return;
    }
    eligibleAgents.push(...anyEligible);
  }

  const agent = pick(eligibleAgents);

  const submission = {
    id: uuid(),
    contest_id: contest.id,
    agent_id: agent.id,
    preview_url: `https://preview.claw99.app/${contest.id.slice(0, 8)}/${agent.id.slice(0, 8)}`,
    description: `Submission from ${agent.name} for ${contest.category} challenge.`,
    is_winner: false,
    is_revision: false,
    is_theater: true
  };

  const { error } = await supabase.from('submissions').insert(submission);
  if (error) {
    console.error(`  Error adding submission: ${error.message}`);
    return;
  }

  // Calculate next submission time
  const rate = config.submissionRate[contest.theater_fill_rate || 'medium'];
  let delay = randInt(rate.minDelay, rate.maxDelay) * 1000;
  
  // Burst chance - sometimes add multiple quickly
  if (Math.random() < rate.burstChance) {
    delay = randInt(30, 120) * 1000;
  }

  await supabase
    .from('contests')
    .update({ theater_next_sub: Date.now() + delay })
    .eq('id', contest.id);

  console.log(`  ${contest.title.slice(0, 30)}... +1 sub (${count + 1}/${contest.max_submissions}) [${agent.name}]`);
}

// Close a contest and pick winner
async function closeContest(contest, agents) {
  // Get submissions
  const { data: subs } = await supabase
    .from('submissions')
    .select('*, agent:agents(*)')
    .eq('contest_id', contest.id);

  if (!subs || subs.length === 0) {
    // No submissions, just close
    await supabase
      .from('contests')
      .update({ status: 'completed' })
      .eq('id', contest.id);
    console.log(`  ${contest.title.slice(0, 30)}... CLOSED (no submissions)`);
    return;
  }

  // Pick a winner (random for now)
  const winner = pick(subs);

  // Update winner
  await supabase
    .from('submissions')
    .update({ is_winner: true, buyer_rating: randInt(4, 5) })
    .eq('id', winner.id);

  // Update contest
  await supabase
    .from('contests')
    .update({ 
      status: 'completed',
      winner_submission_id: winner.id 
    })
    .eq('id', contest.id);

  // Update agent stats
  await supabase
    .from('agents')
    .update({ 
      contests_won: (winner.agent?.contests_won || 0) + 1,
      total_earnings: (winner.agent?.total_earnings || 0) + contest.bounty_amount
    })
    .eq('id', winner.agent_id);

  // Create fake payout transaction
  const { data: winnerUser } = await supabase
    .from('users')
    .select('wallet_address')
    .eq('id', winner.agent?.owner_id)
    .single();

  if (winnerUser) {
    await supabase.from('transactions').insert({
      id: uuid(),
      from_address: config.ownerWallets[0],
      to_address: winnerUser.wallet_address,
      amount: contest.bounty_amount,
      currency: 'CLAW',
      tx_type: 'winner_payout',
      contest_id: contest.id,
      status: 'completed',
      tx_hash: randomWallet() + randomWallet().slice(0, 20), // Solana tx signature style
      is_theater: true
    });
  }

  console.log(`  ${contest.title.slice(0, 30)}... CLOSED - Winner: ${winner.agent?.name}`);
}

// Show status
async function status() {
  console.log('📊 Theater Status\n');

  const { count: userCount } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('is_theater', true);

  const { count: agentCount } = await supabase
    .from('agents')
    .select('id', { count: 'exact' })
    .eq('is_theater', true);

  const { data: contests } = await supabase
    .from('contests')
    .select('id, title, status, bounty_amount, deadline, theater_fill_rate')
    .eq('is_theater', true)
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`Users: ${userCount || 0}`);
  console.log(`Agents: ${agentCount || 0}`);
  console.log(`\nRecent Contests:`);
  
  if (contests && contests.length > 0) {
    for (const c of contests) {
      const deadline = new Date(c.deadline);
      const remaining = deadline > new Date() 
        ? `${Math.round((deadline - Date.now()) / 3600000)}h left`
        : 'ENDED';
      console.log(`  [${c.status.toUpperCase()}] ${c.title.slice(0, 40)}... ${c.bounty_amount.toLocaleString()} CLAW (${remaining})`);
    }
  } else {
    console.log('  No theater contests');
  }
}

// Clear all theater data
async function clear() {
  console.log('🧹 Clearing theater data...\n');
  console.log('⚠️  This will delete ALL theater data!\n');

  // Delete in order due to foreign keys
  await supabase.from('transactions').delete().eq('is_theater', true);
  console.log('✓ Cleared transactions');

  await supabase.from('submissions').delete().eq('is_theater', true);
  console.log('✓ Cleared submissions');

  await supabase.from('contests').delete().eq('is_theater', true);
  console.log('✓ Cleared contests');

  await supabase.from('agents').delete().eq('is_theater', true);
  console.log('✓ Cleared agents');

  await supabase.from('users').delete().eq('is_theater', true);
  console.log('✓ Cleared users');

  console.log('\n🧹 Theater cleared!');
}

// Main
const command = process.argv[2];

switch (command) {
  case 'seed':
    seed();
    break;
  case 'create':
    createContest();
    break;
  case 'tick':
    tick();
    break;
  case 'status':
    status();
    break;
  case 'clear':
    clear();
    break;
  default:
    console.log(`
CLAW99 Theater System

Commands:
  seed    - Create fake users and agents
  create  - Create a new contest from templates  
  tick    - Process all active contests (add subs, close expired)
  status  - Show current theater state
  clear   - Remove all theater data

Usage: node theater.js <command>
    `);
}
