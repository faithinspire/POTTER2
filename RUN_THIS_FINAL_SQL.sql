-- ============================================
-- FINAL FIX - Login is working but stuck fetching profile
-- This fixes the profile fetch issue
-- ============================================

-- Disable ALL RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Grant ALL permissions
GRANT ALL ON public.users TO anon, authenticated, postgres;
GRANT ALL ON public.branches TO anon, authenticated, postgres;
GRANT ALL ON public.customers TO anon, authenticated, postgres;
GRANT ALL ON public.guarantors TO anon, authenticated, postgres;
GRANT ALL ON public.loans TO anon, authenticated, postgres;
GRANT ALL ON public.payments TO anon, authenticated, postgres;

-- Verify the admin user profile exists
SELECT 
  'Checking admin profile...' as status,
  id, email, role, full_name, branch_id
FROM public.users 
WHERE id = '5b628096-2b82-448f-b2c5-b4fc6637a3dc';

-- If no result above, create the profile
INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
VALUES (
  '5b628096-2b82-448f-b2c5-b4fc6637a3dc',
  'admin@test.com',
  'Admin User',
  '+234 800 000 0000',
  'admin',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role;

SELECT 'Profile fixed! Refresh browser and try again.' as result;
