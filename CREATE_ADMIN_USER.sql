-- ============================================
-- CREATE ADMIN USER MANUALLY
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: First, create the auth user in Supabase Dashboard
-- Go to Authentication > Users > Add User
-- Email: admin@test.com
-- Password: admin123
-- Then copy the user ID and replace 'YOUR_USER_ID_HERE' below

-- Step 2: Run this SQL (replace YOUR_USER_ID_HERE with actual ID)
INSERT INTO public.users (
  id,
  email,
  full_name,
  phone,
  role,
  branch_id
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- Replace with actual user ID from step 1
  'admin@test.com',
  'Admin User',
  '+234 800 000 0000',
  'admin',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id;

-- Verify it worked
SELECT * FROM public.users WHERE email = 'admin@test.com';
