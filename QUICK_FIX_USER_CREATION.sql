-- ============================================
-- QUICK FIX - Run this NOW in Supabase SQL Editor
-- ============================================

-- This removes the foreign key constraint that's causing the error
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Done! Now try creating a user again from the app
-- The user creation should work immediately

-- ============================================
-- VERIFY IT WORKED
-- ============================================
SELECT 
  conname as constraint_name
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
  AND conname = 'users_id_fkey';

-- If this returns no rows, the constraint is removed and you're good to go!
