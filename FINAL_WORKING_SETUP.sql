-- ============================================
-- FINAL WORKING SETUP
-- This works with existing tables
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Disable RLS on all tables
ALTER TABLE IF EXISTS branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS disbursements DISABLE ROW LEVEL SECURITY;

-- Step 2: Check if branches exist, if not create them
INSERT INTO branches (id, name, address, phone)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  'Ikeja Branch',
  '123 Ikeja Road, Lagos',
  '+234 800 000 0001'
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'Ikeja Branch');

INSERT INTO branches (id, name, address, phone)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  'Lekki Branch',
  '456 Lekki Phase 1, Lagos',
  '+234 800 000 0002'
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'Lekki Branch');

-- Step 3: Delete existing admin user (if any)
DELETE FROM users WHERE email = 'admin@millenniumpotter.com';
DELETE FROM auth.users WHERE email = 'admin@millenniumpotter.com';

-- Step 4: Create admin user
DO $$
DECLARE
  admin_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
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
  
  RAISE NOTICE 'Admin user created successfully!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating admin: %', SQLERRM;
END $$;

-- Step 5: Verify everything
SELECT 
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM branches) as branches,
  (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
  (SELECT email FROM users WHERE role = 'admin' LIMIT 1) as admin_email;

-- ============================================
-- DONE! Login with:
-- Email: admin@millenniumpotter.com
-- Password: Password123!
-- ============================================
