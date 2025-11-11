-- Fix: Create admin profile in public.users table
-- This links the auth user to the public user profile

-- First, get the admin user ID from auth
DO $$
DECLARE
  admin_auth_id UUID;
BEGIN
  -- Get the admin user ID from auth.users
  SELECT id INTO admin_auth_id
  FROM auth.users
  WHERE email = 'admin@millenniumpotter.com';

  -- Check if profile already exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = admin_auth_id) THEN
    -- Create the profile
    INSERT INTO users (id, email, full_name, phone, role, branch_id)
    VALUES (
      admin_auth_id,
      'admin@millenniumpotter.com',
      'Admin User',
      '+234 800 000 0000',
      'admin',
      NULL
    );
    
    RAISE NOTICE 'Admin profile created successfully!';
  ELSE
    RAISE NOTICE 'Admin profile already exists!';
  END IF;
END $$;

-- Verify the fix
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  'Profile exists!' as status
FROM users u
WHERE u.email = 'admin@millenniumpotter.com';
