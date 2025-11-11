-- STEP 1: Create admin profile in public.users
-- This links auth.users to public.users

DO $$
DECLARE
  admin_auth_id UUID;
BEGIN
  -- Get admin user ID from auth
  SELECT id INTO admin_auth_id
  FROM auth.users
  WHERE email = 'admin@millenniumpotter.com';

  -- Delete existing profile if any (to avoid conflicts)
  DELETE FROM users WHERE email = 'admin@millenniumpotter.com';

  -- Create fresh admin profile
  INSERT INTO users (id, email, full_name, phone, role, branch_id)
  VALUES (
    admin_auth_id,
    'admin@millenniumpotter.com',
    'Admin User',
    '+234 800 000 0000',
    'admin',
    NULL
  );

  RAISE NOTICE 'Admin profile created with ID: %', admin_auth_id;
END $$;

-- STEP 2: Confirm email
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin@millenniumpotter.com';

-- STEP 3: Verify everything is set up
SELECT 
  'SUCCESS! Admin is ready to login' as status,
  u.id,
  u.email,
  u.full_name,
  u.role,
  au.email_confirmed_at
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE u.email = 'admin@millenniumpotter.com';
