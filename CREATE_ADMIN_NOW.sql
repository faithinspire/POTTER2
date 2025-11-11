-- ============================================
-- CREATE ADMIN USER - RUN THIS NOW!
-- Copy and paste into Supabase SQL Editor
-- ============================================

-- Step 1: Check if admin already exists
SELECT id, email FROM auth.users WHERE email = 'admin@millenniumpotter.com';

-- If no result, continue with Step 2
-- If result exists, skip to Step 3

-- Step 2: Create admin user in auth.users
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users
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
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@millenniumpotter.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    NOW(),
    NOW(),
    '',
    '',
    ''
  );
  
  -- Insert into public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    branch_id
  )
  VALUES (
    new_user_id,
    'admin@millenniumpotter.com',
    'Admin User',
    '+234 800 000 0000',
    'admin',
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Admin user created with ID: %', new_user_id;
END $$;

-- Step 3: Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify admin user exists
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  u.full_name,
  u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email = 'admin@millenniumpotter.com';

-- ============================================
-- DONE! Now try logging in with:
-- Email: admin@millenniumpotter.com
-- Password: Password123!
-- ============================================
