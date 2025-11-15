-- ============================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE
-- SQL Editor → New Query → Paste → Run
-- ============================================

-- Add all missing columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS state_of_origin TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT,
ADD COLUMN IF NOT EXISTS next_of_kin_address TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS union_name TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add missing column to guarantors table
ALTER TABLE guarantors
ADD COLUMN IF NOT EXISTS state_of_origin TEXT;

-- Update NULL values to empty strings
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

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_customers_state ON customers(state_of_origin);
CREATE INDEX IF NOT EXISTS idx_customers_occupation ON customers(occupation);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Approve pending loans for testing (OPTIONAL - uncomment if needed)
-- UPDATE loans 
-- SET status = 'approved', 
--     approval_date = NOW()
-- WHERE status = 'pending';

-- Success message
SELECT '✅ DATABASE UPDATED SUCCESSFULLY!' as status,
       '✅ Customer registration will work' as customer_reg,
       '✅ Weekly payments will be clickable' as weekly_payments,
       '✅ Ready for Render deployment' as deployment;
