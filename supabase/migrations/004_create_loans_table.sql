-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  subadmin_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 100),
  duration_weeks INTEGER NOT NULL CHECK (duration_weeks > 0 AND duration_weeks <= 104),
  weekly_payment DECIMAL(12,2) NOT NULL CHECK (weekly_payment > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
  application_date TIMESTAMPTZ DEFAULT NOW(),
  approval_date TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_approval CHECK (
    (status = 'approved' AND approval_date IS NOT NULL AND approved_by IS NOT NULL) OR
    (status = 'rejected' AND rejection_reason IS NOT NULL) OR
    (status NOT IN ('approved', 'rejected'))
  )
);

-- Add comments
COMMENT ON TABLE loans IS 'Loan applications and their lifecycle status';
COMMENT ON COLUMN loans.status IS 'Loan status: pending, approved, rejected, active, completed, defaulted';
COMMENT ON COLUMN loans.weekly_payment IS 'Calculated weekly payment amount including interest';
COMMENT ON COLUMN loans.duration_weeks IS 'Loan duration in weeks (max 104 weeks = 2 years)';
COMMENT ON COLUMN loans.subadmin_id IS 'Sub-admin responsible for approving this loan';

-- Create indexes for performance
CREATE INDEX idx_loans_customer ON loans(customer_id);
CREATE INDEX idx_loans_agent ON loans(agent_id);
CREATE INDEX idx_loans_branch ON loans(branch_id);
CREATE INDEX idx_loans_subadmin ON loans(subadmin_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_application_date ON loans(application_date);
CREATE INDEX idx_loans_branch_status ON loans(branch_id, status);
