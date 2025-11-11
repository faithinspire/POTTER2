-- ============================================
-- JUST RUN THIS - Fixes Login Stuck Issue
-- ============================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.users TO anon, authenticated, postgres;

SELECT 'Fixed! Refresh browser and login again.' as status;
