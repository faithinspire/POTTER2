-- ============================================
-- SIMPLE EMAIL CHANGE TEMPLATE
-- ============================================
-- Instructions:
-- 1. Replace 'OLD_EMAIL' with current email
-- 2. Replace 'NEW_EMAIL' with new email
-- 3. Copy and run in Supabase SQL Editor
-- ============================================

-- ADMIN EMAIL CHANGE
UPDATE auth.users 
SET email = 'NEW_EMAIL',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"NEW_EMAIL"')
WHERE email = 'OLD_EMAIL';

UPDATE public.users 
SET email = 'NEW_EMAIL'
WHERE email = 'OLD_EMAIL';

-- ============================================
-- EXAMPLES (Copy and modify these):
-- ============================================

-- Example 1: Change admin email
UPDATE auth.users 
SET email = 'myemail@gmail.com',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"myemail@gmail.com"')
WHERE email = 'admin@millenniumpotter.com';

UPDATE public.users 
SET email = 'myemail@gmail.com'
WHERE email = 'admin@millenniumpotter.com';

-- Example 2: Change agent email
UPDATE auth.users 
SET email = 'agent.john@gmail.com',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"agent.john@gmail.com"')
WHERE email = 'agent1.ikeja@millenniumpotter.com';

UPDATE public.users 
SET email = 'agent.john@gmail.com'
WHERE email = 'agent1.ikeja@millenniumpotter.com';

-- ============================================
-- VERIFY YOUR CHANGES
-- ============================================
SELECT 
  email,
  full_name,
  role,
  phone
FROM public.users
ORDER BY role, full_name;
