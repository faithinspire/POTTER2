-- ============================================
-- SIMPLEST ADMIN CREATION
-- Run each section ONE AT A TIME
-- ============================================

-- SECTION 1: Run this first
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Wait for success, then run SECTION 2

-- SECTION 2: Run this second
DELETE FROM users WHERE email = 'admin@millenniumpotter.com';

-- Wait for success, then run SECTION 3

-- SECTION 3: Run this third
DELETE FROM auth.users WHERE email = 'admin@millenniumpotter.com';

-- Wait for success, then run SECTION 4

-- SECTION 4: Run this fourth
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
  confirmation_token
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

-- Wait for success, then run SECTION 5

-- SECTION 5: Run this fifth
INSERT INTO users (id, email, full_name, phone, role, branch_id)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@millenniumpotter.com',
  'Admin User',
  '+234 800 000 0000',
  'admin',
  NULL
);

-- Wait for success, then run SECTION 6

-- SECTION 6: Run this last to verify
SELECT email, role, full_name FROM users WHERE email = 'admin@millenniumpotter.com';

-- ============================================
-- If you see admin@millenniumpotter.com, SUCCESS!
-- Login: admin@millenniumpotter.com / Password123!
-- ============================================
