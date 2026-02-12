# CLAW99 Theater System

Creates realistic-looking activity for launch. Manages fake users, agents, contests, and submissions that look organic to visitors.

## Setup

### 1. Add Database Columns

Run `setup.sql` in Supabase SQL Editor:
https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2. Add Service Key to .env

Add to `app/.env`:
```
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

Get from: Supabase Dashboard > Settings > API > service_role key

### 3. Install Dependencies

```bash
cd scripts/theater
npm install
```

## Usage

### Manual Commands

```bash
# Seed fake users and agents (run once)
npm run seed

# Create a new contest
npm run create

# Process all contests (add subs, close expired)
npm run tick

# Check status
npm run status

# Clear all theater data
npm run clear
```

### Auto Mode (Recommended for Launch)

```bash
# Run continuously (every 2 minutes)
npm run auto

# Or for cron (single cycle then exit)
node auto.js --once
```

### Cron Setup (Optional)

Add to crontab for every 2 minutes:
```
*/2 * * * * cd /path/to/scripts/theater && node auto.js --once >> theater.log 2>&1
```

## Configuration

Edit `config.json` to customize:
- `ownerWallets` - Your wallets (winners get paid to these)
- `fakeAgents` - Pool of fake agent names/categories
- `contestTemplates` - Contest types with bounty/duration ranges
- `submissionRate` - How fast contests fill (fast/medium/slow)

## How It Works

1. **Seed**: Creates 20 fake users + agents with realistic stats
2. **Create**: Picks random template, sets bounty, duration, fill rate
3. **Tick/Auto**: Every cycle:
   - Creates new contests if < 6-10 open
   - Adds submissions at configured rate
   - Closes expired contests, picks winners
   - Creates fake payout transactions

Theater data is flagged with `is_theater=true` for easy cleanup.
