-- ============================================
-- COMPLETE FIX FOR USER REGISTRATION
-- Run ALL of these in Supabase SQL Editor
-- ============================================

-- PROBLEM: Foreign key constraint fails because auth.users 
-- requires email confirmation before the user is fully created

-- SOLUTION 1: Remove the foreign key constraint (Recommended)
-- ============================================

-- Drop the problematic constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add it back with ON DELETE CASCADE (safer)
ALTER TABLE public.users
ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

-- The DEFERRABLE INITIALLY DEFERRED allows the constraint
-- to be checked at the end of the transaction, not immediately


-- SOLUTION 2: Create a function to handle user creation
-- ============================================

CREATE OR REPLACE FUNCTION create_user_with_profile(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_role TEXT,
  p_branch_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Create auth user (this will be auto-confirmed if email confirmation is disabled)
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
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(), -- Auto-confirm email
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object('full_name', p_full_name, 'phone', p_phone, 'role', p_role),
    NOW(),
    NOW(),
    '',
    ''
  )
  RETURNING id INTO v_user_id;

  -- Create user profile
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    branch_id
  )
  VALUES (
    v_user_id,
    p_email,
    p_full_name,
    p_phone,
    p_role,
    p_branch_id
  );

  -- Return success
  v_result := json_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_user_with_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_with_profile TO anon;


-- SOLUTION 3: Simpler - Just disable the constraint check
-- ============================================

-- Disable foreign key checks temporarily
SET CONSTRAINTS ALL DEFERRED;

-- Or permanently disable for users table
ALTER TABLE public.users 
ALTER CONSTRAINT users_id_fkey 
DEFERRABLE INITIALLY DEFERRED;


-- ============================================
-- TEST THE FIX
-- ============================================

-- Test creating a user with the function
SELECT create_user_with_profile(
  'test@example.com',
  'TestPassword123!',
  'Test User',
  '08012345678',
  'agent',
  (SELECT id FROM branches LIMIT 1)
);

-- Verify the user was created
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  au.email_confirmed_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'test@example.com';

-- Clean up test user
DELETE FROM public.users WHERE email = 'test@example.com';
DELETE FROM auth.users WHERE email = 'test@example.com';


-- ============================================
-- RECOMMENDED: Use the function approach
-- ============================================

-- This is the safest and most reliable method
-- Call it from your app like this:
-- SELECT create_user_with_profile('email', 'password', 'name', 'phone', 'role', 'branch_id');
