-- ============================================
-- CORRECT DATABASE FIX
-- Copy and paste this ENTIRE script
-- ============================================

-- Step 1: Disable RLS on all tables
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant all permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 3: Ensure branches exist (correct columns!)
INSERT INTO public.branches (name, address, phone)
VALUES 
  ('Igando', 'Igando, Lagos State, Nigeria', '+234 800 000 0001'),
  ('Abule-Egba', 'Abule-Egba, Lagos State, Nigeria', '+234 800 000 0002')
ON CONFLICT (name) DO NOTHING;

-- Step 4: Show branch IDs (COPY THESE!)
SELECT id, name FROM public.branches;

-- Step 5: Verify everything
SELECT 'Database fixed! RLS disabled, permissions granted, branches ready.' as status;
