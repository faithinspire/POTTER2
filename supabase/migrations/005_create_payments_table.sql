-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  amount_due DECIMAL(12,2) NOT NULL CHECK (amount_due > 0),
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  payment_date DATE NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid', 'partial', 'overdue')),
  notes TEXT,
  
  -- Unique constraint: one payment record per loan per date
  CONSTRAINT unique_payment_per_loan_date UNIQUE (loan_id, payment_date)
);

-- Add comments
COMMENT ON TABLE payments IS 'Daily payment records for loan tracking';
COMMENT ON COLUMN payments.status IS 'Payment status: paid (full), unpaid, partial, overdue';
COMMENT ON COLUMN payments.payment_date IS 'The date this payment was due/made';
COMMENT ON COLUMN payments.recorded_at IS 'Timestamp when payment was recorded in system';

-- Create indexes for performance
CREATE INDEX idx_payments_loan ON payments(loan_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_agent ON payments(agent_id);
CREATE INDEX idx_payments_branch ON payments(branch_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_branch_date ON payments(branch_id, payment_date);
CREATE INDEX idx_payments_agent_date ON payments(agent_id, payment_date);

-- Create function to automatically set payment status based on amount
CREATE OR REPLACE FUNCTION set_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount_paid >= NEW.amount_due THEN
    NEW.status := 'paid';
  ELSIF NEW.amount_paid > 0 THEN
    NEW.status := 'partial';
  ELSIF NEW.payment_date < CURRENT_DATE THEN
    NEW.status := 'overdue';
  ELSE
    NEW.status := 'unpaid';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set payment status
CREATE TRIGGER trigger_set_payment_status
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_status();

COMMENT ON FUNCTION set_payment_status IS 'Automatically determines payment status based on amount paid';
