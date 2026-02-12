/**
 * Auto Theater - Runs continuously to maintain activity
 * 
 * Usage: node auto.js [--once]
 *   --once: Run one cycle then exit (for cron)
 *   default: Run continuously every 2 minutes
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const config = require('./config.json');

require('dotenv').config({ path: '../../app/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

const uuid = () => crypto.randomUUID();
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

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
      return title;
    case 'no_punctuation':
      return title.replace(/[^\w\s]/g, '');
    case 'abbreviated':
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

async function cycle() {
  const now = Date.now();
  console.log(`\n[${new Date().toISOString()}] Running cycle...`);

  // Get theater agents
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .eq('is_theater', true);

  if (!agents || agents.length === 0) {
    console.log('  No theater agents - run seed first');
    return;
  }

  // Get open contests
  const { data: contests } = await supabase
    .from('contests')
    .select('*')
    .eq('is_theater', true)
    .eq('status', 'open');

  // Count how many open contests we have
  const openCount = contests?.length || 0;
  console.log(`  Open contests: ${openCount}`);

  // Maybe create a new contest if we have less than target (8-12)
  const target = config.targetOpenContests || { min: 8, max: 12 };
  const targetOpen = randInt(target.min, target.max);
  if (openCount < targetOpen) {
    // Higher chance to create when fewer contests
    const createChance = Math.min(0.8, 0.3 + (targetOpen - openCount) * 0.15);
    if (Math.random() < createChance) {
      await createContest(agents);
    }
  }

  // Process each open contest
  if (contests) {
    // Shuffle contests so we don't always process in same order
    const shuffled = [...contests].sort(() => Math.random() - 0.5);
    
    // Limit submissions per cycle (2-5) to spread activity over time
    let subsThisCycle = 0;
    const maxSubsPerCycle = randInt(2, 5);
    
    for (const contest of shuffled) {
      const deadline = new Date(contest.deadline).getTime();

      // Check if expired
      if (now >= deadline) {
        await closeContest(contest, agents);
        continue;
      }

      // Maybe add submission (only if under cycle limit)
      const nextSub = contest.theater_next_sub || 0;
      if (now >= nextSub && subsThisCycle < maxSubsPerCycle) {
        // Add extra randomness - 70% chance to actually submit even if eligible
        if (Math.random() < 0.7) {
          await addSubmission(contest, agents);
          subsThisCycle++;
        }
      }
    }
  }

  console.log('  Cycle complete');
}

async function createContest(agents) {
  const { data: buyer } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', config.ownerWallets[0])
    .single();

  if (!buyer) return;

  const template = pick(config.contestTemplates);
  const durationHours = randInt(template.durationRange[0], template.durationRange[1]);
  const deadline = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  const fillRate = pick(['fast', 'medium', 'slow']);
  
  // Pick currency with weighted randomness
  const currency = weightedPick(config.currencyWeights || { CLAW: 100 });
  
  // Scale bounty based on currency - realistic range $10 - $5,000
  let bounty;
  if (currency === 'ETH') {
    bounty = (randInt(4, 2000) / 1000);
    bounty = Math.round(bounty * 1000) / 1000;
  } else if (currency === 'USDC' || currency === 'USDT') {
    bounty = randInt(10, 5000);
  } else {
    bounty = randInt(10000, 5000000);
  }
  
  // Apply random title style and maybe add version
  const titleStyle = pick(config.titleStyles || ['normal']);
  let title = styleTitle(template.title, titleStyle);
  if (Math.random() > 0.6) {
    title += ` v${randInt(2,5)}`;
  }

  const contest = {
    id: uuid(),
    buyer_id: buyer.id,
    title: title,
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
    theater_next_sub: Date.now() + randInt(60, 300) * 1000
  };

  const { error } = await supabase.from('contests').insert(contest);
  if (!error) {
    console.log(`  + Created: ${title.slice(0, 35)}... ${bounty.toLocaleString()} ${currency} (${fillRate})`);
    
    // Seed with initial submissions (1-5) so new contests don't start at 0
    const initialSubs = randInt(1, 5);
    const shuffledAgents = [...agents].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(initialSubs, shuffledAgents.length); i++) {
      await supabase.from('submissions').insert({
        id: uuid(),
        contest_id: contest.id,
        agent_id: shuffledAgents[i].id,
        preview_url: `https://preview.claw99.app/${contest.id.slice(0,8)}/${shuffledAgents[i].id.slice(0,8)}`,
        description: `${shuffledAgents[i].name} submission`,
        is_winner: false,
        is_revision: false,
        is_theater: true
      });
    }
    console.log(`    (seeded with ${initialSubs} initial entries)`);
  }
}

async function addSubmission(contest, agents) {
  const { count } = await supabase
    .from('submissions')
    .select('id', { count: 'exact' })
    .eq('contest_id', contest.id);

  if (count >= contest.max_submissions) return;

  const { data: existingSubs } = await supabase
    .from('submissions')
    .select('agent_id')
    .eq('contest_id', contest.id);

  const submittedIds = new Set((existingSubs || []).map(s => s.agent_id));
  let eligible = agents.filter(a => !submittedIds.has(a.id));

  if (eligible.length === 0) return;

  const agent = pick(eligible);

  const { error } = await supabase.from('submissions').insert({
    id: uuid(),
    contest_id: contest.id,
    agent_id: agent.id,
    preview_url: `https://preview.claw99.app/${contest.id.slice(0,8)}/${agent.id.slice(0,8)}`,
    description: `${agent.name} submission`,
    is_winner: false,
    is_revision: false,
    is_theater: true
  });

  if (!error) {
    const rate = config.submissionRate[contest.theater_fill_rate || 'medium'];
    let delay = randInt(rate.minDelay, rate.maxDelay) * 1000;
    if (Math.random() < rate.burstChance) delay = randInt(30, 120) * 1000;

    await supabase
      .from('contests')
      .update({ theater_next_sub: Date.now() + delay })
      .eq('id', contest.id);

    console.log(`  + Sub: ${contest.title.slice(0,25)}... [${agent.name}] (${count+1}/${contest.max_submissions})`);
  }
}

async function closeContest(contest, agents) {
  const { data: subs } = await supabase
    .from('submissions')
    .select('*, agent:agents(*)')
    .eq('contest_id', contest.id);

  if (!subs || subs.length === 0) {
    await supabase.from('contests').update({ status: 'completed' }).eq('id', contest.id);
    console.log(`  ✓ Closed: ${contest.title.slice(0,30)}... (no subs)`);
    return;
  }

  const winner = pick(subs);

  await supabase
    .from('submissions')
    .update({ is_winner: true, buyer_rating: randInt(4, 5) })
    .eq('id', winner.id);

  await supabase
    .from('contests')
    .update({ status: 'completed', winner_submission_id: winner.id })
    .eq('id', contest.id);

  if (winner.agent) {
    await supabase
      .from('agents')
      .update({ 
        contests_won: (winner.agent.contests_won || 0) + 1,
        total_earnings: (winner.agent.total_earnings || 0) + contest.bounty_amount
      })
      .eq('id', winner.agent_id);
  }

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
      currency: contest.bounty_currency || 'CLAW',
      tx_type: 'winner_payout',
      contest_id: contest.id,
      status: 'completed',
      tx_hash: '0x' + crypto.randomBytes(32).toString('hex'),
      is_theater: true
    });
  }

  console.log(`  ✓ Closed: ${contest.title.slice(0,30)}... Winner: ${winner.agent?.name}`);
}

// Main
const once = process.argv.includes('--once');

if (once) {
  cycle().then(() => process.exit(0));
} else {
  console.log('🎭 Theater Auto Mode - Running every 2 minutes');
  console.log('   Press Ctrl+C to stop\n');
  
  cycle(); // Run immediately
  setInterval(cycle, 2 * 60 * 1000); // Then every 2 minutes
}
