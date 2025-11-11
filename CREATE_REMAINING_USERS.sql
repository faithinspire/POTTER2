-- ============================================
-- CREATE REMAINING USERS (Skip if exists)
-- This only creates users that don't exist yet
-- ============================================

-- Step 1: Setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;

-- Step 2: Create remaining users
DO $$
DECLARE
  v_user_id UUID;
  v_igando_id UUID;
  v_abuleegba_id UUID;
  v_exists BOOLEAN;
BEGIN
  SELECT id INTO v_igando_id FROM public.branches WHERE name = 'Igando';
  SELECT id INTO v_abuleegba_id FROM public.branches WHERE name = 'Abule-Egba';
  
  -- Igando Sub-Admin
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'subadmin.igando@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'subadmin.igando@test.com', crypt('subadmin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'subadmin.igando@test.com', 'Igando Manager', '+234 800 000 0001', 'subadmin', v_igando_id);
    RAISE NOTICE 'Created: Igando Sub-Admin';
  ELSE
    RAISE NOTICE 'Skipped: Igando Sub-Admin (already exists)';
  END IF;
  
  -- Abule-Egba Sub-Admin
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'subadmin.abuleegba@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'subadmin.abuleegba@test.com', crypt('subadmin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'subadmin.abuleegba@test.com', 'Abule-Egba Manager', '+234 800 000 0002', 'subadmin', v_abuleegba_id);
    RAISE NOTICE 'Created: Abule-Egba Sub-Admin';
  ELSE
    RAISE NOTICE 'Skipped: Abule-Egba Sub-Admin (already exists)';
  END IF;
  
  -- Igando Agent 1
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'agent1.igando@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent1.igando@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent1.igando@test.com', 'Agent One Igando', '+234 801 000 0001', 'agent', v_igando_id);
    RAISE NOTICE 'Created: Igando Agent 1';
  ELSE
    RAISE NOTICE 'Skipped: Igando Agent 1 (already exists)';
  END IF;
  
  -- Igando Agent 2
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'agent2.igando@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent2.igando@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent2.igando@test.com', 'Agent Two Igando', '+234 801 000 0002', 'agent', v_igando_id);
    RAISE NOTICE 'Created: Igando Agent 2';
  ELSE
    RAISE NOTICE 'Skipped: Igando Agent 2 (already exists)';
  END IF;
  
  -- Abule-Egba Agent 1
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'agent1.abuleegba@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent1.abuleegba@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent1.abuleegba@test.com', 'Agent One Abule-Egba', '+234 802 000 0001', 'agent', v_abuleegba_id);
    RAISE NOTICE 'Created: Abule-Egba Agent 1';
  ELSE
    RAISE NOTICE 'Skipped: Abule-Egba Agent 1 (already exists)';
  END IF;
  
  -- Abule-Egba Agent 2
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'agent2.abuleegba@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent2.abuleegba@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent2.abuleegba@test.com', 'Agent Two Abule-Egba', '+234 802 000 0002', 'agent', v_abuleegba_id);
    RAISE NOTICE 'Created: Abule-Egba Agent 2';
  ELSE
    RAISE NOTICE 'Skipped: Abule-Egba Agent 2 (already exists)';
  END IF;
  
END $$;

-- Show all users
SELECT 
  u.email,
  u.role,
  u.full_name,
  b.name as branch
FROM public.users u
LEFT JOIN public.branches b ON u.branch_id = b.id
ORDER BY 
  CASE u.role WHEN 'admin' THEN 1 WHEN 'subadmin' THEN 2 WHEN 'agent' THEN 3 END,
  b.name,
  u.email;

-- Show credentials
SELECT '
ALL USERS READY!

ADMIN:
  admin@test.com / admin123

IGANDO BRANCH:
  subadmin.igando@test.com / subadmin123
  agent1.igando@test.com / agent123
  agent2.igando@test.com / agent123

ABULE-EGBA BRANCH:
  subadmin.abuleegba@test.com / subadmin123
  agent1.abuleegba@test.com / agent123
  agent2.abuleegba@test.com / agent123

LOGIN: http://localhost:5179/login
' as "CREDENTIALS";
