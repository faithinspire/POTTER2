-- ============================================
-- DELETE ALL DATA IN CORRECT ORDER
-- Run this in Supabase SQL Editor
-- ============================================

-- Delete in correct order (child tables first)
DELETE FROM payments;
DELETE FROM loans;
DELETE FROM guarantors;
DELETE FROM customers;
DELETE FROM disbursements;
DELETE FROM users;
DELETE FROM auth.users;

-- Verify everything is deleted
SELECT 
  'payments' as table_name, COUNT(*) as count FROM payments
UNION ALL
SELECT 'loans', COUNT(*) FROM loans
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users;

-- All should show 0

-- ============================================
-- Now you can create a fresh admin user
-- ============================================
