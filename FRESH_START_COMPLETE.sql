-- ============================================
-- FRESH START - COMPLETE RESET
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================

-- Step 1: Delete all data in correct order
DELETE FROM payments;
DELETE FROM loans;
DELETE FROM guarantors;
DELETE FROM customers;
DELETE FROM disbursements;
DELETE FROM users;
DELETE FROM auth.users;

-- Step 2: Disable RLS on all tables
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS disbursements DISABLE ROW LEVEL SECURITY;

-- Step 3: Create ONE admin user
DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
BEGIN
  -- Create in auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    'admin@yourcompany.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    ''
  );
  
  -- Create in public.users
  INSERT INTO users (id, email, full_name, phone, role, branch_id)
  VALUES (
    admin_id,
    'admin@yourcompany.com',
    'Admin User',
    '+234 800 000 0000',
    'admin',
    NULL
  );
  
  RAISE NOTICE 'Admin user created successfully!';
END $$;

-- Step 4: Verify setup
SELECT 
  'Setup complete!' as status,
  (SELECT COUNT(*) FROM branches) as branches,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT email FROM users WHERE role = 'admin') as admin_email;

-- ============================================
-- DONE! Now login with:
-- Email: admin@yourcompany.com
-- Password: Admin123!
-- ============================================
