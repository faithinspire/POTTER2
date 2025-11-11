-- ============================================
-- RECENT UPDATES MIGRATION
-- Run this if you already have the database set up
-- This adds daily payment support and other recent features
-- ============================================

-- 1. Add daily_payment column if it doesn't exist
ALTER TABLE loans ADD COLUMN IF NOT EXISTS daily_payment DECIMAL(15, 2);

-- 2. Ensure duration_days exists
ALTER TABLE loans ADD COLUMN IF NOT EXISTS duration_days INTEGER;

-- 3. Update existing loans with calculated values
UPDATE loans 
SET duration_days = duration_weeks * 7 
WHERE duration_days IS NULL;

UPDATE loans 
SET daily_payment = ROUND(weekly_payment / 7, 2)
WHERE daily_payment IS NULL AND weekly_payment IS NOT NULL;

-- 4. Create function to auto-calculate daily payment
CREATE OR REPLACE FUNCTION calculate_daily_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate duration_days from duration_weeks
  IF NEW.duration_days IS NULL AND NEW.duration_weeks IS NOT NULL THEN
    NEW.duration_days := NEW.duration_weeks * 7;
  END IF;
  
  -- Auto-calculate daily_payment from weekly_payment
  IF NEW.daily_payment IS NULL AND NEW.weekly_payment IS NOT NULL THEN
    NEW.daily_payment := ROUND(NEW.weekly_payment / 7, 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to auto-calculate daily payment
DROP TRIGGER IF EXISTS trigger_calculate_daily_payment ON loans;
CREATE TRIGGER trigger_calculate_daily_payment
  BEFORE INSERT OR UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION calculate_daily_payment();

-- 6. Ensure disbursements table exists with all columns
CREATE TABLE IF NOT EXISTS disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15, 2) NOT NULL,
  disbursed_by UUID NOT NULL REFERENCES users(id),
  disbursement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create indexes for disbursements if they don't exist
CREATE INDEX IF NOT EXISTS idx_disbursements_agent ON disbursements(agent_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_branch ON disbursements(branch_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_date ON disbursements(disbursement_date);

-- 8. Disable RLS on disbursements
ALTER TABLE disbursements DISABLE ROW LEVEL SECURITY;

-- 9. Ensure photo columns exist on customers and guarantors
ALTER TABLE customers ADD COLUMN IF NOT EXISTS passport_photo_url TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_photo_url TEXT;
ALTER TABLE guarantors ADD COLUMN IF NOT EXISTS passport_photo_url TEXT;
ALTER TABLE guarantors ADD COLUMN IF NOT EXISTS id_photo_url TEXT;

-- 10. Create dashboard stats view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM users WHERE role IN ('agent', 'subadmin', 'admin')) as total_users,
  (SELECT COUNT(*) FROM users WHERE role = 'agent') as total_agents,
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM loans WHERE status = 'active') as active_loans,
  (SELECT COALESCE(SUM(amount), 0) FROM loans WHERE status = 'active') as total_active_loan_amount,
  (SELECT COALESCE(SUM(amount_paid), 0) FROM payments) as total_collected,
  (SELECT COALESCE(SUM(amount), 0) FROM disbursements) as total_disbursed,
  (SELECT 
    CASE 
      WHEN COALESCE(SUM(l.amount), 0) = 0 THEN 0
      ELSE (COALESCE(SUM(p.amount_paid), 0) / COALESCE(SUM(l.amount), 0)) * 100
    END
   FROM loans l
   LEFT JOIN payments p ON l.id = p.loan_id
   WHERE l.status = 'active'
  ) as collection_rate;

-- 11. Grant access to the view
GRANT SELECT ON dashboard_stats TO authenticated;
GRANT SELECT ON dashboard_stats TO anon;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  'Recent updates applied successfully!' as status,
  (SELECT COUNT(*) FROM loans WHERE daily_payment IS NOT NULL) as loans_with_daily_payment,
  (SELECT COUNT(*) FROM disbursements) as total_disbursements,
  (SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'passport_photo_url'
  )) as photo_columns_exist;
