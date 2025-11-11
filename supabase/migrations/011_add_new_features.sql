-- Add new columns for customer and guarantor photos
ALTER TABLE customers ADD COLUMN IF NOT EXISTS passport_photo_url TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_photo_url TEXT;

ALTER TABLE guarantors ADD COLUMN IF NOT EXISTS passport_photo_url TEXT;
ALTER TABLE guarantors ADD COLUMN IF NOT EXISTS id_photo_url TEXT;

-- Change loan duration from weeks to days
ALTER TABLE loans ADD COLUMN IF NOT EXISTS duration_days INTEGER;
UPDATE loans SET duration_days = duration_weeks * 7 WHERE duration_days IS NULL;

-- Create disbursements table for tracking money given to agents
CREATE TABLE IF NOT EXISTS disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15, 2) NOT NULL,
  disbursed_by UUID NOT NULL REFERENCES users(id),
  disbursement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_disbursements_agent ON disbursements(agent_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_branch ON disbursements(branch_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_date ON disbursements(disbursement_date);

-- Create reports table for downloadable reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type VARCHAR(50) NOT NULL,
  generated_by UUID NOT NULL REFERENCES users(id),
  file_url TEXT,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on new tables for now
ALTER TABLE disbursements DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

-- Create view for real-time dashboard stats
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM users WHERE role IN ('agent', 'subadmin', 'admin')) as total_users,
  (SELECT COUNT(*) FROM users WHERE role = 'agent') as total_agents,
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM loans WHERE status = 'active') as active_loans,
  (SELECT COALESCE(SUM(amount), 0) FROM loans WHERE status = 'active') as total_active_loan_amount,
  (SELECT COALESCE(SUM(amount_paid), 0) FROM payments) as total_collected,
  (SELECT COALESCE(SUM(amount), 0) FROM loans WHERE status = 'disbursed') as total_disbursed,
  (SELECT 
    CASE 
      WHEN COALESCE(SUM(l.amount), 0) = 0 THEN 0
      ELSE (COALESCE(SUM(p.amount_paid), 0) / COALESCE(SUM(l.amount), 0)) * 100
    END
   FROM loans l
   LEFT JOIN payments p ON l.id = p.loan_id
   WHERE l.status = 'active'
  ) as collection_rate;

-- Grant access to the view
GRANT SELECT ON dashboard_stats TO authenticated;
GRANT SELECT ON dashboard_stats TO anon;
