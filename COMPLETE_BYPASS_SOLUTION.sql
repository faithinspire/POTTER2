-- ============================================
-- COMPLETE BYPASS - Create Users Directly
-- This creates BOTH auth user AND profile in one go
-- ============================================

-- Step 1: Disable ALL security
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant ALL permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres;
GRANT ALL ON SCHEMA public TO anon, authenticated, postgres;

-- Step 3: Ensure branches exist
INSERT INTO public.branches (name, address, phone)
VALUES 
  ('Igando', 'Igando, Lagos', '+234 800 000 0001'),
  ('Abule-Egba', 'Abule-Egba, Lagos', '+234 800 000 0002')
ON CONFLICT (name) DO NOTHING;

-- Step 4: Create admin user (BOTH auth and profile)
DO $$
DECLARE
  v_user_id UUID;
  v_branch_id UUID;
BEGIN
  -- Generate new user ID
  v_user_id := gen_random_uuid();
  
  -- Create auth user
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
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'admin@test.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Create profile
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
  VALUES (v_user_id, 'admin@test.com', 'Admin User', '+234 800 000 0000', 'admin', NULL);
  
  RAISE NOTICE 'Admin user created! Email: admin@test.com, Password: admin123';
  
  -- Create agent for Igando
  v_user_id := gen_random_uuid();
  SELECT id INTO v_branch_id FROM public.branches WHERE name = 'Igando' LIMIT 1;
  
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
    'agent@test.com', crypt('agent123', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''
  );
  
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
  VALUES (v_user_id, 'agent@test.com', 'Agent User', '+234 800 000 0001', 'agent', v_branch_id);
  
  RAISE NOTICE 'Agent user created! Email: agent@test.com, Password: agent123';
  
END $$;

-- Step 5: Verify users were created
SELECT 'Users created successfully!' as status;
SELECT email, role FROM public.users;

-- Step 6: Show login credentials
SELECT 
  'LOGIN CREDENTIALS:' as info,
  'Admin: admin@test.com / admin123' as admin_login,
  'Agent: agent@test.com / agent123' as agent_login;
