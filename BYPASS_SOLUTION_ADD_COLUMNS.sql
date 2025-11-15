-- ============================================
-- BYPASS SOLUTION: Add Missing Columns
-- Instead of fixing code, add columns to database
-- ============================================

-- Add business_address to customers (bypass solution)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_address TEXT;

-- Add state_of_origin to guarantors (bypass solution)
ALTER TABLE guarantors ADD COLUMN IF NOT EXISTS state_of_origin VARCHAR(100);

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');
NOTIFY pgrst, 'reload schema';

-- Now registration will work!
-- The fields exist in both code AND database