-- ============================================
-- CHANGE USER EMAILS - Run in Supabase SQL Editor
-- ============================================

-- IMPORTANT: This updates BOTH auth.users and public.users tables
-- Replace the demo emails with real emails below

-- ============================================
-- METHOD 1: Change Individual User Emails
-- ============================================

-- Example: Change admin email
-- Step 1: Update auth.users table
UPDATE auth.users 
SET email = 'newemail@example.com',
    raw_user_meta_data = jsonb_set(
      raw_user_meta_data,
      '{email}',
      '"newemail@example.com"'
    )
WHERE email = 'admin@millenniumpotter.com';

-- Step 2: Update public.users table
UPDATE public.users 
SET email = 'newemail@example.com'
WHERE email = 'admin@millenniumpotter.com';

-- ============================================
-- METHOD 2: Change Multiple Emails at Once
-- ============================================

-- Change Admin Email
UPDATE auth.users 
SET email = 'youradmin@gmail.com',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"youradmin@gmail.com"')
WHERE email = 'admin@millenniumpotter.com';

UPDATE public.users 
SET email = 'youradmin@gmail.com'
WHERE email = 'admin@millenniumpotter.com';

-- Change Sub-Admin Ikeja Email
UPDATE auth.users 
SET email = 'ikeja.manager@gmail.com',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"ikeja.manager@gmail.com"')
WHERE email = 'subadmin.ikeja@millenniumpotter.com';

UPDATE public.users 
SET email = 'ikeja.manager@gmail.com'
WHERE email = 'subadmin.ikeja@millenniumpotter.com';

-- Change Sub-Admin Lekki Email
UPDATE auth.users 
SET email = 'lekki.manager@gmail.com',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"lekki.manager@gmail.com"')
WHERE email = 'subadmin.lekki@millenniumpotter.com';

UPDATE public.users 
SET email = 'lekki.manager@gmail.com'
WHERE email = 'subadmin.lekki@millenniumpotter.com';

-- Change Agent 1 Email
UPDATE auth.users 
SET email = 'agent1@gmail.com',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"agent1@gmail.com"')
WHERE email = 'agent1.ikeja@millenniumpotter.com';

UPDATE public.users 
SET email = 'agent1@gmail.com'
WHERE email = 'agent1.ikeja@millenniumpotter.com';

-- Change Agent 2 Email
UPDATE auth.users 
SET email = 'agent2@gmail.com',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"agent2@gmail.com"')
WHERE email = 'agent2.ikeja@millenniumpotter.com';

UPDATE public.users 
SET email = 'agent2@gmail.com'
WHERE email = 'agent2.ikeja@millenniumpotter.com';

-- ============================================
-- METHOD 3: Verify Changes
-- ============================================

-- Check all users and their emails
SELECT 
  u.id,
  u.email as public_email,
  au.email as auth_email,
  u.full_name,
  u.role,
  b.name as branch
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
LEFT JOIN branches b ON u.branch_id = b.id
ORDER BY u.role, u.full_name;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Always update BOTH auth.users and public.users
-- 2. The password remains the same (Password123!)
-- 3. Users can login with new email immediately
-- 4. No need to restart the app
-- 5. Make sure emails are unique
