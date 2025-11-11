-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- Run this to fix the login issue
-- ============================================

-- First, drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Sub-admins can view branch users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Create simple, non-recursive policies

-- 1. Allow users to read their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 2. Allow authenticated users to read all users (simplified for now)
CREATE POLICY "users_select_authenticated"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. Allow service role full access (for admin operations)
CREATE POLICY "users_all_service_role"
  ON users FOR ALL
  USING (auth.role() = 'service_role');

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Success message
SELECT '✅ RLS policies fixed! Try logging in again.' as status;
