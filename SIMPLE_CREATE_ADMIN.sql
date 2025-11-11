-- ============================================
-- SIMPLE ADMIN USER CREATION
-- Run each section one by one in Supabase SQL Editor
-- ============================================

-- SECTION 1: Create auth user
-- Copy and run this first
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'authenticated',
  'authenticated',
  'admin@millenniumpotter.com',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  ''
)
ON CONFLICT (email) DO UPDATE 
SET encrypted_password = crypt('Password123!', gen_salt('bf'));

-- SECTION 2: Create user profile
-- Copy and run this second
INSERT INTO public.users (
  id,
  email,
  full_name,
  phone,
  role,
  branch_id
)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@millenniumpotter.com',
  'Admin User',
  '+234 800 000 0000',
  'admin',
  NULL
)
ON CONFLICT (id) DO UPDATE
SET email = 'admin@millenniumpotter.com',
    role = 'admin';

-- SECTION 3: Disable RLS
-- Copy and run this third
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- SECTION 4: Verify
-- Copy and run this last to check
SELECT 
  au.email as auth_email,
  u.email as profile_email,
  u.full_name,
  u.role,
  au.email_confirmed_at
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email = 'admin@millenniumpotter.com';

-- ============================================
-- If you see a row with data, you're good!
-- Login with:
-- Email: admin@millenniumpotter.com
-- Password: Password123!
-- ============================================
