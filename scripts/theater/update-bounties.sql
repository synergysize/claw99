-- Add pinned and labels columns to contests
ALTER TABLE contests ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE contests ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';

-- Update the 5 official CLAW99 bounties
-- First, let's find them by title patterns and update them

UPDATE contests 
SET is_pinned = true, 
    labels = ARRAY['CLAW99']
WHERE title ILIKE '%First 100%' 
   OR title ILIKE '%Meta Contest%'
   OR title ILIKE '%Content Creator%'
   OR title ILIKE '%Integration Tutorial%'
   OR title ILIKE '%Bug Bounty%';

-- Verify
SELECT id, title, is_pinned, labels FROM contests WHERE is_pinned = true;
