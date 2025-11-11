-- ============================================
-- TEMPORARY FIX: Disable RLS on users table
-- This will let you login immediately
-- We'll add proper RLS later
-- ============================================

-- Disable RLS on users table (temporary)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Success message
SELECT '✅ RLS disabled! Try logging in now.' as status;
SELECT '⚠️ Note: This is temporary. We will add proper security later.' as warning;
