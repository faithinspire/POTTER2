-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'subadmin', 'agent')),
  branch_id UUID REFERENCES branches(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_branch_assignment CHECK (
    (role = 'admin' AND branch_id IS NULL) OR
    (role IN ('subadmin', 'agent') AND branch_id IS NOT NULL)
  )
);

-- Add comments
COMMENT ON TABLE users IS 'User profiles with role-based access control';
COMMENT ON COLUMN users.role IS 'User role: admin (global), subadmin (branch manager), agent (field agent)';
COMMENT ON COLUMN users.branch_id IS 'Branch assignment for subadmin and agent roles';

-- Create index for faster queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_branch ON users(branch_id);
CREATE INDEX idx_users_email ON users(email);
