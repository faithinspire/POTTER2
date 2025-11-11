# How to Manage Users (Agents, Sub-Admins, Admins)

## 🎯 Two Ways to Manage Users

### Method 1: Through the App (Recommended)
### Method 2: Through SQL (For bulk changes)

---

## 📱 Method 1: Register New Users Through App

### Step 1: Login as Admin
1. Go to your app
2. Login with admin credentials
3. You'll see the Admin Dashboard

### Step 2: Go to User Management
1. Click **"Manage Users"** button
2. Or navigate to `/admin/users`

### Step 3: Create New User
1. Click **"Create New User"** button
2. Fill in the form:
   - **Email**: Real email address (e.g., john@gmail.com)
   - **Password**: Choose a strong password
   - **Full Name**: User's full name
   - **Phone**: Phone number
   - **Role**: Select Admin, Sub-Admin, or Agent
   - **Branch**: Select branch (for Sub-Admin and Agent only)
3. Click **"Create User"**

### Step 4: User Can Login
- The new user can immediately login with their email and password
- They'll be redirected to their role-specific dashboard

---

## 💾 Method 2: Change Existing Emails via SQL

### When to Use This:
- Change demo emails to real emails
- Bulk update multiple users
- Fix incorrect emails

### How to Do It:

#### Step 1: Open Supabase SQL Editor
1. Go to Supabase Dashboard
2. Click **SQL Editor** in sidebar
3. Click **New Query**

#### Step 2: Copy and Modify Script
Open `CHANGE_USER_EMAILS.sql` and:

1. **Replace demo emails with real emails**:
```sql
-- Example: Change admin email
UPDATE auth.users 
SET email = 'yourrealemail@gmail.com',
    raw_user_meta_data = jsonb_set(raw_user_meta_data, '{email}', '"yourrealemail@gmail.com"')
WHERE email = 'admin@millenniumpotter.com';

UPDATE public.users 
SET email = 'yourrealemail@gmail.com'
WHERE email = 'admin@millenniumpotter.com';
```

2. **Repeat for each user** you want to change

#### Step 3: Run the Script
1. Paste your modified SQL
2. Click **Run** (or press Ctrl+Enter)
3. Check for success message

#### Step 4: Verify Changes
Run this to see all users:
```sql
SELECT 
  u.email,
  u.full_name,
  u.role,
  b.name as branch
FROM public.users u
LEFT JOIN branches b ON u.branch_id = b.id
ORDER BY u.role;
```

---

## 🔐 Important Notes

### Passwords
- Default password for demo users: `Password123!`
- After changing email, password stays the same
- Users can login with: **new email + same password**

### Email Requirements
- Must be unique (no duplicates)
- Must be valid email format
- Can be any email (Gmail, Yahoo, etc.)

### Both Tables Must Match
Always update BOTH:
1. `auth.users` - Supabase authentication
2. `public.users` - Your app's user data

If you only update one, login will fail!

---

## 📋 Quick Reference

### Current Demo Users:
| Email | Password | Role | Branch |
|-------|----------|------|--------|
| admin@millenniumpotter.com | Password123! | Admin | - |
| subadmin.ikeja@millenniumpotter.com | Password123! | Sub-Admin | Ikeja |
| subadmin.lekki@millenniumpotter.com | Password123! | Sub-Admin | Lekki |
| agent1.ikeja@millenniumpotter.com | Password123! | Agent | Ikeja |
| agent2.ikeja@millenniumpotter.com | Password123! | Agent | Ikeja |

### Example Real Emails:
```sql
-- Admin
admin@millenniumpotter.com → ceo@yourcompany.com

-- Sub-Admins
subadmin.ikeja@millenniumpotter.com → ikeja.manager@yourcompany.com
subadmin.lekki@millenniumpotter.com → lekki.manager@yourcompany.com

-- Agents
agent1.ikeja@millenniumpotter.com → john.doe@gmail.com
agent2.ikeja@millenniumpotter.com → jane.smith@gmail.com
```

---

## 🎯 Recommended Workflow

### For New Company Setup:

1. **Change Admin Email First**
   - Use SQL to change admin@millenniumpotter.com to your real email
   - Login with new email

2. **Create Sub-Admins Through App**
   - Login as admin
   - Go to User Management
   - Create sub-admins with real emails

3. **Create Agents Through App**
   - Login as admin
   - Go to User Management
   - Create agents with real emails

4. **Delete Demo Users** (Optional)
   - Keep them for testing
   - Or delete via SQL:
   ```sql
   DELETE FROM public.users WHERE email LIKE '%@millenniumpotter.com';
   DELETE FROM auth.users WHERE email LIKE '%@millenniumpotter.com';
   ```

---

## 🐛 Troubleshooting

### "Email already exists"
- Check if email is already in use
- Run: `SELECT email FROM auth.users WHERE email = 'youremail@gmail.com';`

### "User not found after login"
- Make sure you updated BOTH tables
- Check: `SELECT * FROM public.users WHERE email = 'youremail@gmail.com';`

### "Cannot create user"
- Check Supabase email confirmation settings
- Make sure RLS is disabled on users table
- Check browser console for errors

---

## ✅ Best Practices

1. **Use Real Emails**: Avoid demo emails in production
2. **Strong Passwords**: Minimum 8 characters, mix of letters/numbers
3. **Unique Emails**: Each user must have unique email
4. **Test First**: Create one test user before bulk creation
5. **Backup**: Export user list before making changes

---

## 🎉 You're Ready!

Choose your method:
- **Quick & Easy**: Use the app (Method 1)
- **Bulk Changes**: Use SQL (Method 2)

Both methods work perfectly!
