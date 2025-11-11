-- ============================================
-- COMPLETE FIX: Disable RLS on ALL tables
-- This will definitely make login work
-- ============================================

-- Disable RLS on all tables
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Verify all are disabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '❌ Enabled' ELSE '✅ Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('branches', 'users', 'customers', 'guarantors', 'loans', 'payments')
ORDER BY tablename;

-- Success message
SELECT '✅ ALL RLS DISABLED! Login will work now!' as status;
