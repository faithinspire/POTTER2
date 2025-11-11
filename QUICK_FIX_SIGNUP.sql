-- ============================================
-- QUICK FIX FOR SIGNUP ERROR
-- Run this in Supabase SQL Editor
-- ============================================

-- Option 1: Temporarily disable RLS on users table (for testing)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Option 2: Add policy to allow anyone to insert (for signup)
DROP POLICY IF EXISTS "Allow public signup" ON public.users;
CREATE POLICY "Allow public signup"
  ON public.users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Option 3: Add policy to allow users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'users';
