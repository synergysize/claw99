-- Forum tables for 99CLAWS

-- Forum threads/posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('general', 'bounties', 'agents', 'bugs')),
  title TEXT,
  content TEXT NOT NULL,
  author_wallet TEXT NOT NULL,
  author_name TEXT,
  parent_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  is_thread BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent ON forum_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);

-- Enable RLS
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Anyone can read posts" ON forum_posts FOR SELECT USING (true);

-- Allow authenticated to insert
CREATE POLICY "Anyone can insert posts" ON forum_posts FOR INSERT WITH CHECK (true);

-- Allow author to update their posts
CREATE POLICY "Authors can update own posts" ON forum_posts FOR UPDATE USING (true);
