-- ============================================
-- JUST CREATE ADMIN USER
-- Run this if tables already exist
-- ============================================

-- Disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Delete existing admin
DELETE FROM users WHERE email = 'admin@millenniumpotter.com';
DELETE FROM auth.users WHERE email = 'admin@millenniumpotter.com';

-- Create admin
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token
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
  ''
);

INSERT INTO users (id, email, full_name, phone, role, branch_id)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@millenniumpotter.com',
  'Admin User',
  '+234 800 000 0000',
  'admin',
  NULL
);

-- Verify
SELECT email, role FROM users WHERE email = 'admin@millenniumpotter.com';

-- ============================================
-- Login: admin@millenniumpotter.com / Password123!
-- ============================================
