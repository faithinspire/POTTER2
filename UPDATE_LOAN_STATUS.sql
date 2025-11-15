-- Update approved loans to be visible in weekly payments
-- Run this in Supabase SQL Editor if you have loans that aren't showing up

-- Check current loan statuses
SELECT id, customer_id, status, amount, weekly_payment, created_at
FROM loans
ORDER BY created_at DESC;

-- Update pending loans to approved (if they should be active)
-- UPDATE loans 
-- SET status = 'approved', 
--     approval_date = NOW()
-- WHERE status = 'pending';

-- Or update specific loans by ID
-- UPDATE loans 
-- SET status = 'approved', 
--     approval_date = NOW()
-- WHERE id = 'YOUR_LOAN_ID_HERE';
