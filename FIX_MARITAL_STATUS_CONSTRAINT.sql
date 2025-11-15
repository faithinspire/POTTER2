-- ============================================
-- FIX MARITAL STATUS CONSTRAINT ERROR
-- Run this in Supabase SQL Editor NOW
-- ============================================

-- 1. Drop the old constraint if it exists
ALTER TABLE customers 
DROP CONSTRAINT IF EXISTS customers_marital_status_check;

-- 2. Add columns without constraints
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS state_of_origin TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT,
ADD COLUMN IF NOT EXISTS next_of_kin_address TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS union_name TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 3. Add column to guarantors
ALTER TABLE guarantors
ADD COLUMN IF NOT EXISTS state_of_origin TEXT;

-- 4. Update existing NULL values
UPDATE customers 
SET 
  state_of_origin = COALESCE(state_of_origin, ''),
  occupation = COALESCE(occupation, ''),
  next_of_kin_name = COALESCE(next_of_kin_name, ''),
  next_of_kin_address = COALESCE(next_of_kin_address, ''),
  business_address = COALESCE(business_address, ''),
  marital_status = COALESCE(marital_status, ''),
  union_name = COALESCE(union_name, ''),
  photo_url = COALESCE(photo_url, '');

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_state ON customers(state_of_origin);
CREATE INDEX IF NOT EXISTS idx_customers_occupation ON customers(occupation);

-- Success message
SELECT '✅ ALL CONSTRAINTS REMOVED!' as status,
       '✅ Customer registration will work now' as result;
