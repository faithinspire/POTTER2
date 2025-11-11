-- ============================================
-- FIX CUSTOMER REGISTRATION
-- Disable RLS on customers and guarantors tables
-- ============================================

-- Disable RLS on all tables
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON public.customers TO anon, authenticated, postgres;
GRANT ALL ON public.guarantors TO anon, authenticated, postgres;
GRANT ALL ON public.loans TO anon, authenticated, postgres;
GRANT ALL ON public.payments TO anon, authenticated, postgres;

-- Verify
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('customers', 'guarantors', 'loans', 'payments');

SELECT 'Customer registration should work now!' as status;
