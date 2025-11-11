# 📋 COPY & PASTE THIS SQL

## 🎯 Instructions

1. Open Supabase Dashboard → SQL Editor
2. Copy EVERYTHING below (including the comments)
3. Paste into SQL Editor
4. Click "Run"
5. Done!

---

## 📝 THE SQL (Copy All of This):

```sql
-- ============================================
-- AUTO USER REGISTRATION TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_branch_id UUID;
BEGIN
  SELECT id INTO v_branch_id FROM public.branches LIMIT 1;
  
  INSERT INTO public.users (
    id, email, full_name, phone, role, branch_id
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent')::user_role,
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'agent') = 'admin' 
      THEN NULL
      ELSE COALESCE((NEW.raw_user_meta_data->>'branch_id')::UUID, v_branch_id)
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
```

---

## ✅ Success Message

You should see:
```
Success. No rows returned
```

---

## 🚀 Now Test It!

1. Go to: http://localhost:5179/signup
2. Create an account
3. Login
4. It works! 🎉

---

## 💡 What This Does

- ✅ Auto-creates user profile when someone signs up
- ✅ No manual SQL needed anymore
- ✅ Users can login immediately
- ✅ Works for all roles (Admin, Sub-Admin, Agent)

**That's it! Copy the SQL above and run it in Supabase!**
