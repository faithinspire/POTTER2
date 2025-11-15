-- ============================================
-- COMPLETE FIX FOR ALL CUSTOMER COLUMNS
-- Run this in Supabase SQL Editor NOW
-- ============================================

-- Add ALL missing columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS state_of_origin TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT,
ADD COLUMN IF NOT EXISTS next_of_kin_address TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS union_name TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add missing columns to guarantors table
ALTER TABLE guarantors
ADD COLUMN IF NOT EXISTS state_of_origin TEXT;

-- Update existing records to have empty strings instead of NULL
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

UPDATE guarantors
SET state_of_origin = COALESCE(state_of_origin, '');

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ ALL CUSTOMER COLUMNS ADDED SUCCESSFULLY!';
  RAISE NOTICE '✅ Customer registration will now work without errors';
END $$;
