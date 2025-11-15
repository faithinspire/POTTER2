-- Fix: "Could not find the 'business_address' column" error
-- This refreshes the Supabase schema cache

-- Option 1: If business_address column exists but shouldn't, remove it
ALTER TABLE customers DROP COLUMN IF EXISTS business_address;

-- Option 2: If you need business_address column, add it
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_address TEXT;

-- Refresh the schema cache by updating the table
ALTER TABLE customers ALTER COLUMN updated_at SET DEFAULT NOW();

-- Verify the customers table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;
