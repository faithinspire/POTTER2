-- ============================================
-- RUN THIS IMMEDIATELY IN SUPABASE
-- Copy and paste this ENTIRE file
-- ============================================

ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS disbursements DISABLE ROW LEVEL SECURITY;

SELECT 'RLS DISABLED - Now refresh your browser!' as message;
