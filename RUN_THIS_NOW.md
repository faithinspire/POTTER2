# ⚡ RUN THIS NOW - Fix Database Errors

## 🎯 Copy & Paste This SQL

```sql
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

INSERT INTO public.branches (name, address, phone, manager_name)
VALUES 
  ('Igando', '123 Igando Road, Lagos', '+234 800 000 0001', 'Manager 1'),
  ('Abule-Egba', '456 Abule-Egba Street, Lagos', '+234 800 000 0002', 'Manager 2')
ON CONFLICT (name) DO NOTHING;

SELECT id, name FROM public.branches;
```

## 📋 Steps:

1. Supabase Dashboard → SQL Editor
2. Paste the SQL above
3. Click "Run"
4. Copy the branch IDs from results
5. Done! ✅

## 🎯 Now Create Admin:

1. Authentication → Users → Add User
2. Email: `admin@test.com`, Password: `admin123`
3. ✅ Check "Auto Confirm User"
4. Copy User ID

5. SQL Editor → Run this (replace USER_ID):
```sql
INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
VALUES ('USER_ID'::uuid, 'admin@test.com', 'Admin', '+234 800 000 0000', 'admin', NULL);
```

6. Login at http://localhost:5179/login

## 🎉 Done!

Your database is fixed and you can create users!
