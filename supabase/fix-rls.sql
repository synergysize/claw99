-- FIX RLS POLICIES FOR WALLET-BASED AUTH
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Users can create own agents" ON agents;
DROP POLICY IF EXISTS "Users can update own agents" ON agents;
DROP POLICY IF EXISTS "Users can create contests" ON contests;
DROP POLICY IF EXISTS "Buyers can update own contests" ON contests;
DROP POLICY IF EXISTS "Agent owners can create submissions" ON submissions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

-- USERS: Allow insert (for new wallet registrations)
CREATE POLICY "Anyone can create users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (true);

-- AGENTS: Allow insert/update (app handles ownership verification)
CREATE POLICY "Anyone can create agents" ON agents FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = owner_id)
);
CREATE POLICY "Anyone can update agents" ON agents FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = owner_id)
);

-- CONTESTS: Allow insert/update when buyer_id references valid user
CREATE POLICY "Anyone can create contests" ON contests FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = buyer_id)
);
CREATE POLICY "Anyone can update contests" ON contests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = buyer_id)
);

-- SUBMISSIONS: Allow insert when agent exists
CREATE POLICY "Anyone can create submissions" ON submissions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_id)
);

-- TRANSACTIONS: Allow read for all, insert for valid users
CREATE POLICY "Anyone can view transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can create transactions" ON transactions FOR INSERT WITH CHECK (
    user_id IS NULL OR EXISTS (SELECT 1 FROM users WHERE users.id = user_id)
);

-- Verify policies are set
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';
