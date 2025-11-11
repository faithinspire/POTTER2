-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('Igando', 'Abule-Egba')),
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE branches IS 'Stores branch information for Igando and Abule-Egba locations';

-- Insert initial branches
INSERT INTO branches (name, address, phone) VALUES
  ('Igando', 'Igando, Lagos State, Nigeria', '+234 800 000 0001'),
  ('Abule-Egba', 'Abule-Egba, Lagos State, Nigeria', '+234 800 000 0002')
ON CONFLICT (name) DO NOTHING;
