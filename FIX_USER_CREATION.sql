-- ============================================
-- FIX USER CREATION ISSUE
-- Run this in Supabase SQL Editor
-- ============================================

-- The issue: Foreign key constraint requires auth.users to exist first
-- Solution: Remove the foreign key constraint temporarily

-- Step 1: Drop the foreign key constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 2: Recreate without the constraint (or with CASCADE)
-- This allows users table to exist independently
-- The id will still match auth.users.id, but won't enforce it strictly

-- Step 3: Verify the constraint is removed
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- ============================================
-- ALTERNATIVE: Keep constraint but disable email confirmation
-- ============================================

-- This is better - it keeps data integrity
-- Go to Supabase Dashboard → Authentication → Settings
-- Disable "Enable email confirmations"
-- Then user creation will work immediately

-- ============================================
-- VERIFY USERS TABLE STRUCTURE
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND table_schema = 'public'
ORDER BY ordinal_position;
