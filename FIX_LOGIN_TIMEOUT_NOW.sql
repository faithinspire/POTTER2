-- ============================================
-- FIX LOGIN TIMEOUT - RUN THIS NOW!
-- Copy and paste into Supabase SQL Editor
-- ============================================

-- Disable RLS on users table to allow login
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Should show rowsecurity = false

-- ============================================
-- DONE! Now try logging in again
-- ============================================
