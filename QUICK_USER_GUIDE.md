# Quick User Management Guide

## 🚀 Register New Agent (Through App)

1. **Login as Admin**
   - Email: admin@millenniumpotter.com
   - Password: Password123!

2. **Click "Manage Users"** on dashboard

3. **Click "Create New User"** button

4. **Fill the form:**
   ```
   Email: agent.name@gmail.com
   Password: YourPassword123
   Full Name: Agent Full Name
   Phone: 08012345678
   Role: Agent
   Branch: Select Ikeja or Lekki
   ```

5. **Click "Create User"**

6. **Done!** New agent can login immediately

---

## 📧 Change Email (SQL Method)

### Quick Steps:

1. **Open Supabase** → SQL Editor

2. **Copy this template:**
```sql
-- Change admin email
UPDATE auth.users 
SET email = 'YOUR_NEW_EMAIL@gmail.com',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"YOUR_NEW_EMAIL@gmail.com"')
WHERE email = 'admin@millenniumpotter.com';

UPDATE public.users 
SET email = 'YOUR_NEW_EMAIL@gmail.com'
WHERE email = 'admin@millenniumpotter.com';
```

3. **Replace:**
   - `YOUR_NEW_EMAIL@gmail.com` with your real email
   - `admin@millenniumpotter.com` with the email you want to change

4. **Click Run**

5. **Done!** Login with new email (same password)

---

## 📋 All Demo Users

| Current Email | Role | Password |
|--------------|------|----------|
| admin@millenniumpotter.com | Admin | Password123! |
| subadmin.ikeja@millenniumpotter.com | Sub-Admin | Password123! |
| subadmin.lekki@millenniumpotter.com | Sub-Admin | Password123! |
| agent1.ikeja@millenniumpotter.com | Agent | Password123! |
| agent2.ikeja@millenniumpotter.com | Agent | Password123! |

---

## ✅ What You Can Do

### Through App:
- ✅ Create new users (any role)
- ✅ View all users
- ✅ See user statistics
- ✅ Assign users to branches

### Through SQL:
- ✅ Change emails
- ✅ Change passwords
- ✅ Update user details
- ✅ Delete users
- ✅ Bulk operations

---

## 🎯 Recommended: Change Admin Email First

```sql
-- Step 1: Change admin email to your real email
UPDATE auth.users 
SET email = 'youremail@gmail.com',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"youremail@gmail.com"')
WHERE email = 'admin@millenniumpotter.com';

UPDATE public.users 
SET email = 'youremail@gmail.com'
WHERE email = 'admin@millenniumpotter.com';

-- Step 2: Verify
SELECT email, full_name, role FROM public.users WHERE role = 'admin';

-- Step 3: Login with new email + Password123!
```

---

## 💡 Pro Tips

1. **Always update BOTH tables** (auth.users and public.users)
2. **Password stays the same** after email change
3. **Emails must be unique** - no duplicates
4. **Test with one user first** before bulk changes
5. **Keep demo users** for testing (or delete them later)

---

## 🆘 Need Help?

Check these files:
- `HOW_TO_MANAGE_USERS.md` - Detailed guide
- `CHANGE_USER_EMAILS.sql` - Full SQL examples
- `CHANGE_EMAILS_TEMPLATE.sql` - Quick template

---

## ✨ You're All Set!

Choose your method and start managing users!
