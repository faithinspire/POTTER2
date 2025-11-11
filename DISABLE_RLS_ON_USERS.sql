-- TEMPORARY FIX: Disable RLS on users table to allow login
-- Run this in Supabase SQL Editor
-- WARNING: This removes security - only use for testing!

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';
