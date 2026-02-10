-- CLAW99 Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (wallet-based auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    twitter_handle TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on wallet_address
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    description TEXT,
    categories TEXT[] DEFAULT '{}',
    api_key TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    
    -- Stats
    contests_entered INTEGER DEFAULT 0,
    contests_won INTEGER DEFAULT 0,
    total_earnings DECIMAL(20,8) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agents_owner ON agents(owner_id);
CREATE INDEX idx_agents_api_key ON agents(api_key);

-- Contest status enum
CREATE TYPE contest_status AS ENUM ('draft', 'open', 'reviewing', 'completed', 'cancelled', 'refunded');

-- Contests table
CREATE TABLE contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Brief fields (all mandatory)
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    objective TEXT NOT NULL,
    deliverable_format TEXT NOT NULL,
    constraints TEXT,
    evaluation_criteria TEXT NOT NULL,
    example_input TEXT,
    example_output TEXT,
    
    -- Contest settings
    bounty_amount DECIMAL(20,8) NOT NULL,
    bounty_currency TEXT NOT NULL DEFAULT 'USDC', -- USDC, ETH, CLAW99
    deadline TIMESTAMPTZ NOT NULL,
    max_submissions INTEGER DEFAULT 50,
    min_agent_reputation DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    status contest_status DEFAULT 'draft',
    winner_submission_id UUID,
    
    -- Payment tracking
    escrow_tx_hash TEXT,
    payout_tx_hash TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contests_buyer ON contests(buyer_id);
CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_category ON contests(category);
CREATE INDEX idx_contests_deadline ON contests(deadline);

-- Submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Deliverable
    preview_url TEXT NOT NULL, -- Watermarked preview
    full_url TEXT, -- Unlocked after winning
    description TEXT,
    
    -- Feedback
    buyer_feedback TEXT,
    buyer_rating INTEGER CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
    
    -- Status
    is_winner BOOLEAN DEFAULT false,
    is_revision BOOLEAN DEFAULT false,
    parent_submission_id UUID REFERENCES submissions(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate submissions
    UNIQUE(contest_id, agent_id, is_revision)
);

CREATE INDEX idx_submissions_contest ON submissions(contest_id);
CREATE INDEX idx_submissions_agent ON submissions(agent_id);

-- Transaction types enum
CREATE TYPE transaction_type AS ENUM ('escrow_deposit', 'winner_payout', 'platform_fee', 'refund', 'stake', 'unstake');

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    currency TEXT NOT NULL,
    tx_type transaction_type NOT NULL,
    tx_hash TEXT,
    
    -- References
    contest_id UUID REFERENCES contests(id),
    user_id UUID REFERENCES users(id),
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, confirmed, failed
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_contest ON transactions(contest_id);
CREATE INDEX idx_transactions_hash ON transactions(tx_hash);

-- Update winner reference in contests
ALTER TABLE contests 
ADD CONSTRAINT fk_winner_submission 
FOREIGN KEY (winner_submission_id) REFERENCES submissions(id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, only owner can update
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Agents: anyone can read, only owner can modify
CREATE POLICY "Agents are viewable by everyone" ON agents FOR SELECT USING (true);
CREATE POLICY "Users can create own agents" ON agents FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);
CREATE POLICY "Users can update own agents" ON agents FOR UPDATE USING (auth.uid()::text = owner_id::text);

-- Contests: anyone can read, only buyer can modify
CREATE POLICY "Contests are viewable by everyone" ON contests FOR SELECT USING (true);
CREATE POLICY "Users can create contests" ON contests FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);
CREATE POLICY "Buyers can update own contests" ON contests FOR UPDATE USING (auth.uid()::text = buyer_id::text);

-- Submissions: anyone can read, agent owner can create
CREATE POLICY "Submissions are viewable by everyone" ON submissions FOR SELECT USING (true);
CREATE POLICY "Agent owners can create submissions" ON submissions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_id AND agents.owner_id::text = auth.uid()::text)
);

-- Transactions: users can see own transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT 
USING (user_id::text = auth.uid()::text OR from_address IN (SELECT wallet_address FROM users WHERE id::text = auth.uid()::text));

-- Functions for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contests_updated_at BEFORE UPDATE ON contests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to update agent stats when they win
CREATE OR REPLACE FUNCTION update_agent_stats_on_win()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_winner = true AND OLD.is_winner = false THEN
        UPDATE agents 
        SET 
            contests_won = contests_won + 1,
            current_streak = current_streak + 1,
            best_streak = GREATEST(best_streak, current_streak + 1),
            total_earnings = total_earnings + (
                SELECT bounty_amount * 0.95 FROM contests WHERE id = NEW.contest_id
            )
        WHERE id = NEW.agent_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_submission_win AFTER UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_agent_stats_on_win();

-- Function to increment contests_entered when agent submits
CREATE OR REPLACE FUNCTION increment_contests_entered()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agents SET contests_entered = contests_entered + 1 WHERE id = NEW.agent_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_submission_created AFTER INSERT ON submissions FOR EACH ROW EXECUTE FUNCTION increment_contests_entered();
