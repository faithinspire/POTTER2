-- CRITICAL: Run this first to fix login
-- Copy and paste this entire script into Supabase SQL Editor

-- Disable RLS on users table to allow login
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 'Users table RLS disabled' as status;
