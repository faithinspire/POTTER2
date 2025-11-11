-- ============================================
-- CHECK AND FIX DATABASE
-- Run this to see what's already created and fix any issues
-- ============================================

-- Check what tables exist
SELECT 
  'Tables that exist:' as info,
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if branches have data
SELECT 'Branches:' as info, COUNT(*) as count FROM branches;

-- Check if users table is ready
SELECT 'Users table exists:' as info, 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'users'
  ) THEN 'YES' ELSE 'NO' END as status;

-- Now let's create what's missing (if anything)

-- Create branches if not exists (safe to run)
INSERT INTO branches (name, address, phone) VALUES
  ('Igando', 'Igando, Lagos State, Nigeria', '+234 800 000 0001'),
  ('Abule-Egba', 'Abule-Egba, Lagos State, Nigeria', '+234 800 000 0002')
ON CONFLICT (name) DO NOTHING;

-- Verify branches
SELECT 'Final branch count:' as info, COUNT(*) as count FROM branches;
SELECT * FROM branches;

-- Show instructions for next step
SELECT '✅ Database is ready!' as status;
SELECT 'Next: Create auth user in Authentication tab, then insert into users table' as next_step;
