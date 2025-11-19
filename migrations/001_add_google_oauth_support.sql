-- Migration: Add Google OAuth Support
-- Date: 2025-11-19

-- 1. Make password_hash nullable (OAuth users won't have passwords)
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Add OAuth provider columns (only the ones we need)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255);

-- 3. Add unique constraint for OAuth provider + provider ID combination
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_oauth_provider_id') THEN
        ALTER TABLE users ADD CONSTRAINT unique_oauth_provider_id UNIQUE (oauth_provider, oauth_provider_id);
    END IF;
END $$;

-- 4. Add a check constraint: user must have either password OR oauth_provider
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_auth_method_check') THEN
        ALTER TABLE users ADD CONSTRAINT user_auth_method_check 
        CHECK (
            (password_hash IS NOT NULL AND oauth_provider IS NULL) OR
            (password_hash IS NULL AND oauth_provider IS NOT NULL) OR
            (password_hash IS NOT NULL AND oauth_provider IS NOT NULL)
        );
    END IF;
END $$;

-- 5. Create an index for faster OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider, oauth_provider_id);
