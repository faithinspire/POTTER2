# 🚀 Start From Scratch - Complete Setup

## 🎯 The Issue
"Database error querying schema" means your database tables don't exist yet.

## ✅ Complete Solution (5 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Complete Setup
1. Open the file: `COMPLETE_DATABASE_SETUP.sql`
2. **Copy EVERYTHING** in that file
3. **Paste** into Supabase SQL Editor
4. Click **RUN** (or press Ctrl+Enter)
5. Wait for it to complete (should take 5-10 seconds)

### Step 3: Verify Success
You should see output like:
```
status: Database setup complete!
branches_count: 2
users_count: 1
admin_email: admin@millenniumpotter.com
```

### Step 4: Login
1. Go to your app
2. Login with:
   - **Email:** admin@millenniumpotter.com
   - **Password:** Password123!
3. Should work! ✅

---

## 📋 What the Script Does

1. ✅ Creates all database tables:
   - branches
   - users
   - customers
   - guarantors
   - loans
   - payments
   - disbursements

2. ✅ Inserts 2 branches:
   - Ikeja Branch
   - Lekki Branch

3. ✅ Creates admin user:
   - Email: admin@millenniumpotter.com
   - Password: Password123!

4. ✅ Disables RLS on all tables (fixes timeout issues)

5. ✅ Verifies everything was created

---

## 🐛 If You Get Errors

### Error: "relation already exists"
**Meaning:** Tables already exist
**Solution:** That's fine! The script handles this. Continue to Step 4.

### Error: "permission denied"
**Meaning:** Not enough permissions
**Solution:** Make sure you're using the Supabase SQL Editor, not a different tool.

### Error: "syntax error"
**Meaning:** Didn't copy entire script
**Solution:** Make sure you copied EVERYTHING from the file.

---

## ✅ Verification Checklist

After running the script:

- [ ] No errors in SQL Editor
- [ ] See "Database setup complete!" message
- [ ] branches_count shows 2
- [ ] users_count shows 1
- [ ] admin_email shows admin@millenniumpotter.com
- [ ] Can access login page
- [ ] Can login with admin credentials
- [ ] Dashboard loads successfully

---

## 🎯 Quick Test

After setup, test these:

1. **Login as Admin**
   - Email: admin@millenniumpotter.com
   - Password: Password123!
   - Should see Admin Dashboard

2. **Check User Management**
   - Click "Manage Users"
   - Should see admin user in list

3. **Create Test User**
   - Click "Create New User"
   - Fill form and submit
   - Should create successfully

---

## 📚 Alternative: Run Migrations One by One

If the complete script doesn't work, run migrations individually:

1. `supabase/migrations/001_create_branches_table.sql`
2. `supabase/migrations/002_create_users_table.sql`
3. `supabase/migrations/003_create_customers_guarantors_tables.sql`
4. `supabase/migrations/004_create_loans_table.sql`
5. `supabase/migrations/005_create_payments_table.sql`
6. `supabase/migrations/008_seed_initial_data.sql`
7. `supabase/migrations/011_add_new_features.sql`

Then run `COPY_PASTE_THIS_NOW.sql` to create admin user.

---

## 💡 Pro Tips

1. **Copy entire script** - Don't miss any lines
2. **Wait for completion** - Don't interrupt
3. **Check output** - Should see success message
4. **Refresh browser** - Clear cache
5. **Use incognito** - Test fresh

---

## 🎉 Success!

After running the setup:
- ✅ All tables created
- ✅ Branches inserted
- ✅ Admin user created
- ✅ RLS disabled
- ✅ Ready to use

**Login and start using your app!** 🚀

---

## 🆘 Need Help?

If still having issues:
1. Check Supabase project is active (not paused)
2. Verify .env file has correct Supabase URL
3. Check browser console (F12) for errors
4. Try different browser
5. Clear all browser data and try again

**The complete setup script should work!**
