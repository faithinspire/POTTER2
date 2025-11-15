-- ============================================
-- FIX ALL REGISTRATION ISSUES - RUN THIS NOW
-- ============================================

-- 1. Remove business_address from customers if it exists
ALTER TABLE customers DROP COLUMN IF EXISTS business_address CASCADE;

-- 2. Remove state_of_origin from guarantors if it exists  
ALTER TABLE guarantors DROP COLUMN IF EXISTS state_of_origin CASCADE;

-- 3. Verify customers table has correct columns
-- Run this to see what columns exist:
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- 4. Verify guarantors table has correct columns
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'guarantors'
ORDER BY ordinal_position;

-- 5. Force Supabase to reload schema cache
SELECT pg_notify('pgrst', 'reload schema');
NOTIFY pgrst, 'reload schema';

-- 6. Wait 10 seconds, then try registration again