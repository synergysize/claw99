-- Theater System Schema Additions
-- Run this in Supabase SQL Editor before using theater.js

-- Add is_theater flag to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_theater BOOLEAN DEFAULT false;

-- Add is_theater flag to agents  
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_theater BOOLEAN DEFAULT false;

-- Add theater columns to contests
ALTER TABLE contests ADD COLUMN IF NOT EXISTS is_theater BOOLEAN DEFAULT false;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS theater_fill_rate TEXT;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS theater_next_sub BIGINT;

-- Add is_theater flag to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_theater BOOLEAN DEFAULT false;

-- Add is_theater flag to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_theater BOOLEAN DEFAULT false;

-- Create indexes for theater queries
CREATE INDEX IF NOT EXISTS idx_users_theater ON users(is_theater) WHERE is_theater = true;
CREATE INDEX IF NOT EXISTS idx_agents_theater ON agents(is_theater) WHERE is_theater = true;
CREATE INDEX IF NOT EXISTS idx_contests_theater ON contests(is_theater) WHERE is_theater = true;
CREATE INDEX IF NOT EXISTS idx_submissions_theater ON submissions(is_theater) WHERE is_theater = true;
CREATE INDEX IF NOT EXISTS idx_transactions_theater ON transactions(is_theater) WHERE is_theater = true;

-- Done!
SELECT 'Theater schema ready!' as status;
