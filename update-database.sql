-- Update database to add avatar_emoji field
-- Copy this code and run it in Supabase SQL Editor

-- Add avatar_emoji field to bot_configs table
ALTER TABLE public.bot_configs ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '🤖';

-- Update null values with default value
UPDATE public.bot_configs 
SET avatar_emoji = '🤖' 
WHERE avatar_emoji IS NULL;

-- Make the field required (NOT NULL)
ALTER TABLE public.bot_configs ALTER COLUMN avatar_emoji SET NOT NULL;
ALTER TABLE public.bot_configs ALTER COLUMN avatar_emoji SET DEFAULT '🤖';

SELECT 'Database updated successfully! avatar_emoji column added to bot_configs table.' as result;