-- ============================================
-- CREATE ADMIN USER ONLY
-- This doesn't touch branches at all
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete existing admin user (if any)
DELETE FROM users WHERE email = 'admin@millenniumpotter.com';
DELETE FROM auth.users WHERE email = 'admin@millenniumpotter.com';

-- Step 3: Create admin user
DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
BEGIN
  -- Create in auth.users
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
    admin_id,
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
  );
  
  -- Create in public.users
  INSERT INTO users (id, email, full_name, phone, role, branch_id)
  VALUES (
    admin_id,
    'admin@millenniumpotter.com',
    'Admin User',
    '+234 800 000 0000',
    'admin',
    NULL
  );
  
  RAISE NOTICE 'Admin user created with ID: %', admin_id;
END $$;

-- Step 4: Verify admin user was created
SELECT 
  'Admin user created successfully!' as status,
  email,
  role,
  full_name
FROM users 
WHERE email = 'admin@millenniumpotter.com';

-- ============================================
-- DONE! Now login with:
-- Email: admin@millenniumpotter.com
-- Password: Password123!
-- ============================================
