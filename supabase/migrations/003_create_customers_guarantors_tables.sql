-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  id_type TEXT NOT NULL CHECK (id_type IN ('NIN', 'BVN', 'Drivers License', 'Voters Card')),
  id_number TEXT NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint for ID number per branch
  CONSTRAINT unique_customer_id_per_branch UNIQUE (id_number, branch_id)
);

-- Add comments
COMMENT ON TABLE customers IS 'Customer records registered by agents';
COMMENT ON COLUMN customers.id_type IS 'Type of identification: NIN, BVN, Drivers License, or Voters Card';
COMMENT ON COLUMN customers.agent_id IS 'Agent who registered this customer';

-- Create indexes
CREATE INDEX idx_customers_branch ON customers(branch_id);
CREATE INDEX idx_customers_agent ON customers(agent_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_id_number ON customers(id_number);
CREATE INDEX idx_customers_name ON customers(full_name);

-- Create guarantors table
CREATE TABLE IF NOT EXISTS guarantors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  relationship TEXT NOT NULL,
  id_type TEXT NOT NULL CHECK (id_type IN ('NIN', 'BVN', 'Drivers License', 'Voters Card')),
  id_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE guarantors IS 'Guarantor information for customer loan applications';
COMMENT ON COLUMN guarantors.relationship IS 'Relationship to customer (e.g., spouse, sibling, friend)';

-- Create indexes
CREATE INDEX idx_guarantors_customer ON guarantors(customer_id);
CREATE INDEX idx_guarantors_phone ON guarantors(phone);
