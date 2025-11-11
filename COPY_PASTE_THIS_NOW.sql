-- ============================================
-- COPY THIS ENTIRE FILE AND PASTE IN SUPABASE
-- Then click RUN
-- ============================================

-- Delete any existing admin user
DELETE FROM public.users WHERE email = 'admin@millenniumpotter.com';
DELETE FROM auth.users WHERE email = 'admin@millenniumpotter.com';

-- Create admin user
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
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    branch_id
  )
  VALUES (
    admin_id,
    'admin@millenniumpotter.com',
    'Admin User',
    '+234 800 000 0000',
    'admin',
    NULL
  );
  
  RAISE NOTICE 'Admin user created successfully!';
END $$;

-- Disable RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT 
  'SUCCESS! Admin user created' as status,
  email,
  role,
  full_name
FROM public.users 
WHERE email = 'admin@millenniumpotter.com';

-- ============================================
-- NOW LOGIN WITH:
-- Email: admin@millenniumpotter.com
-- Password: Password123!
-- ============================================
