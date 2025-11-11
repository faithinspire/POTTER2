# 🔄 Migration Updates - Recent Adjustments

## What's New

Recent adjustments have been made to support:
- ✅ **Daily payment calculations** (auto-calculated from weekly payments)
- ✅ **Duration in days** (auto-calculated from weeks)
- ✅ **Disbursements tracking** (money given to agents)
- ✅ **Photo uploads** (customer & guarantor passport/ID photos)
- ✅ **Dashboard statistics** (real-time analytics view)

---

## 📁 New Migration Files

### 1. Individual Migration
**File:** `supabase/migrations/012_add_daily_payment_support.sql`
- Adds daily_payment column
- Creates auto-calculation trigger
- Updates existing loan records

### 2. Quick Update (For Existing Databases)
**File:** `APPLY_RECENT_UPDATES.sql`
- Run this if you already have a database set up
- Adds all recent features without recreating tables
- Safe to run multiple times (uses IF NOT EXISTS)

### 3. Updated Consolidated File
**File:** `RUN_ALL_MIGRATIONS.sql`
- Fully updated with all recent changes
- Use this for fresh database setup
- Includes auto-calculation triggers

---

## 🚀 How to Apply Updates

### Option A: Fresh Database Setup
If starting from scratch:
```sql
-- Run this in Supabase SQL Editor
-- Copy entire contents of: RUN_ALL_MIGRATIONS.sql
```

### Option B: Update Existing Database
If you already have data:
```sql
-- Run this in Supabase SQL Editor
-- Copy entire contents of: APPLY_RECENT_UPDATES.sql
```

---

## 🎯 What Each Update Does

### Daily Payment Auto-Calculation
```sql
-- When you create a loan with weekly_payment = 7000
-- System automatically calculates:
-- daily_payment = 1000 (7000 / 7)
-- duration_days = 56 (8 weeks * 7)
```

### Disbursements Table
Tracks money given to agents:
- Amount disbursed
- Daily or weekly period type
- Date and notes
- Links to agent and branch

### Photo Support
Customers and guarantors can now have:
- `passport_photo_url` - Profile photo
- `id_photo_url` - ID card photo

### Dashboard Stats View
Real-time analytics without complex queries:
- Total users, agents, customers
- Active loans count and amount
- Total collected payments
- Collection rate percentage

---

## ✅ Verification

After running the migration, verify with:

```sql
-- Check if daily_payment exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND column_name = 'daily_payment';

-- Check if trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_calculate_daily_payment';

-- Test the dashboard stats view
SELECT * FROM dashboard_stats;
```

---

## 🔧 Migration Order

If running individual migrations:
1. `001_create_branches_table.sql`
2. `002_create_users_table.sql`
3. `003_create_customers_guarantors_tables.sql`
4. `004_create_loans_table.sql`
5. `005_create_payments_table.sql`
6. `006_enable_rls_and_policies.sql`
7. `007_create_triggers_and_functions.sql`
8. `008_seed_initial_data.sql`
9. `009_create_advanced_features_tables.sql`
10. `010_auto_create_user_profile.sql`
11. `011_add_new_features.sql`
12. **`012_add_daily_payment_support.sql`** ← NEW!

---

## 💡 Pro Tips

1. **Use the consolidated file** for new setups - it's faster and guaranteed to work
2. **Use APPLY_RECENT_UPDATES.sql** if you have existing data
3. **Backup your data** before running migrations on production
4. **Test in development** first before applying to production

---

## 🐛 Troubleshooting

### If daily_payment isn't calculating:
```sql
-- Manually trigger the calculation
UPDATE loans SET updated_at = NOW();
```

### If disbursements table is missing:
```sql
-- Run just the disbursements section from APPLY_RECENT_UPDATES.sql
```

### If photo columns are missing:
```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS passport_photo_url TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_photo_url TEXT;
ALTER TABLE guarantors ADD COLUMN IF NOT EXISTS passport_photo_url TEXT;
ALTER TABLE guarantors ADD COLUMN IF NOT EXISTS id_photo_url TEXT;
```

---

## 📊 What's Included in Each File

| File | Fresh Setup | Update Existing | Auto-Calculations | Disbursements | Photos |
|------|-------------|-----------------|-------------------|---------------|--------|
| `RUN_ALL_MIGRATIONS.sql` | ✅ | ❌ | ✅ | ✅ | ✅ |
| `APPLY_RECENT_UPDATES.sql` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `012_add_daily_payment_support.sql` | ❌ | ✅ | ✅ | ❌ | ❌ |

---

**Ready to apply? Choose your option above and run the SQL in Supabase!** 🚀
