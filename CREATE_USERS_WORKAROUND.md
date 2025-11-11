# 🔧 Workaround: Create Users via Supabase Dashboard

## 🎯 The Issue

The "Database error saving new user" happens because:
- Supabase has email confirmation enabled by default
- The app tries to create users but gets blocked
- This is a Supabase configuration issue

## ⚡ SIMPLE WORKAROUND (Works 100%)

### Instead of using the app's "Add User" button, create users directly in Supabase:

---

## 📋 How to Create Users

### For Each User You Want to Create:

#### Step 1: Create Auth User (30 seconds)
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"Authentication"** → **"Users"**
4. Click **"Add User"**
5. Fill in:
   - **Email**: user@example.com
   - **Password**: password123
   - **✅ CHECK "Auto Confirm User"** ← IMPORTANT!
6. Click **"Create User"**
7. **COPY THE USER ID** (long string)

#### Step 2: Create Profile (30 seconds)
1. Click **"SQL Editor"** in sidebar
2. Click **"New Query"**
3. Use the template below based on role:

---

## 📝 SQL Templates

### For Admin User:
```sql
INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
VALUES (
  'USER_ID_HERE'::uuid,
  'admin@example.com',
  'Admin Name',
  '+234 800 000 0000',
  'admin',
  NULL
);
```

### For Sub-Admin User:
```sql
-- First, get branch ID
SELECT id, name FROM public.branches;

-- Then insert (replace USER_ID and BRANCH_ID)
INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
VALUES (
  'USER_ID_HERE'::uuid,
  'subadmin@example.com',
  'Sub Admin Name',
  '+234 800 000 0001',
  'subadmin',
  'BRANCH_ID_HERE'::uuid
);
```

### For Agent User:
```sql
-- First, get branch ID
SELECT id, name FROM public.branches;

-- Then insert (replace USER_ID and BRANCH_ID)
INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
VALUES (
  'USER_ID_HERE'::uuid,
  'agent@example.com',
  'Agent Name',
  '+234 800 000 0002',
  'agent',
  'BRANCH_ID_HERE'::uuid
);
```

---

## 🎯 Quick Example

### Create an Agent:

1. **Supabase Auth** → Add User:
   - Email: `agent1@test.com`
   - Password: `agent123`
   - Auto Confirm: ✅
   - Copy ID: `abc-123-def-456`

2. **Get Branch ID**:
```sql
SELECT id, name FROM public.branches;
-- Copy Igando or Abule-Egba ID
```

3. **Create Profile**:
```sql
INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
VALUES (
  'abc-123-def-456'::uuid,
  'agent1@test.com',
  'Agent One',
  '+234 800 000 0001',
  'agent',
  'branch-id-here'::uuid
);
```

4. **Done!** User can login at http://localhost:5179/login

---

## ✅ Verification

After creating a user, verify:

```sql
-- Check auth user exists
SELECT * FROM auth.users WHERE email = 'agent1@test.com';

-- Check profile exists
SELECT * FROM public.users WHERE email = 'agent1@test.com';

-- Should see both!
```

---

## 🎉 Users You Can Create

### Recommended Setup:

1. **1 Admin** (yourself)
   - Full access to everything
   - No branch needed

2. **2 Sub-Admins** (one per branch)
   - Igando branch manager
   - Abule-Egba branch manager

3. **4-6 Agents** (split between branches)
   - 2-3 for Igando
   - 2-3 for Abule-Egba

---

## 💡 Pro Tips

### Creating Multiple Users:
- Use a spreadsheet to track User IDs
- Create all auth users first
- Then run SQL for all profiles
- Test each login after creation

### Password Management:
- Use simple passwords for testing (agent123, etc.)
- Users can change passwords later
- Document passwords somewhere safe

### Branch IDs:
- Get branch IDs once and save them
- Igando: `[copy from query]`
- Abule-Egba: `[copy from query]`
- Reuse for all users in that branch

---

## 🐛 Why This Happens

### The Root Cause:
- Supabase has email confirmation enabled
- When app tries to create user, Supabase sends confirmation email
- But the profile creation fails because user isn't confirmed yet
- Creating via dashboard with "Auto Confirm" bypasses this

### The Permanent Fix:
Would require:
1. Disabling email confirmation in Supabase settings
2. OR using Supabase Admin API (requires backend)
3. OR implementing email confirmation flow

### For Now:
- Creating via dashboard is fastest
- Works 100% of the time
- Takes only 1 minute per user
- No code changes needed

---

## 🚀 Quick Workflow

### To Create 5 Users:

1. **Open Supabase Dashboard**
2. **Create 5 auth users** (5 minutes)
   - agent1@test.com
   - agent2@test.com
   - agent3@test.com
   - subadmin1@test.com
   - subadmin2@test.com
3. **Copy all User IDs**
4. **Get branch IDs** (1 query)
5. **Run 5 INSERT statements** (2 minutes)
6. **Done!** All users can login

---

## ✅ Success Checklist

For each user:
- [ ] Created in Supabase Auth
- [ ] "Auto Confirm User" was checked
- [ ] User ID copied
- [ ] Profile created in users table
- [ ] Can login at /login
- [ ] Dashboard loads correctly

---

## 📞 Quick Reference

### Get Branch IDs:
```sql
SELECT id, name FROM public.branches;
```

### Check User Exists:
```sql
SELECT * FROM public.users WHERE email = 'user@example.com';
```

### Delete User (if mistake):
```sql
DELETE FROM public.users WHERE email = 'user@example.com';
-- Then delete from Auth dashboard too
```

---

**This workaround is simple, reliable, and works every time! 🎉**
