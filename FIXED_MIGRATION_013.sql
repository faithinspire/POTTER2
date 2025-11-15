-- FIXED Migration: Enhanced Customer Features and Analytics
-- Copy and paste this entire SQL into Supabase SQL Editor

-- Add new columns to customers table for enhanced features
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS state_of_origin VARCHAR(100),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
ADD COLUMN IF NOT EXISTS next_of_kin_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS next_of_kin_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS next_of_kin_relationship VARCHAR(50),
ADD COLUMN IF NOT EXISTS union_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS registration_notes TEXT;

-- Create daily_payment_schedule table for tracking expected payments
CREATE TABLE IF NOT EXISTS daily_payment_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    expected_amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_type VARCHAR(20) DEFAULT 'daily' CHECK (payment_type IN ('daily', 'weekly', 'monthly')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'partial')),
    actual_amount DECIMAL(15,2) DEFAULT 0,
    payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for daily payment schedule
CREATE INDEX IF NOT EXISTS idx_daily_payment_schedule_customer ON daily_payment_schedule(customer_id);
CREATE INDEX IF NOT EXISTS idx_daily_payment_schedule_loan ON daily_payment_schedule(loan_id);
CREATE INDEX IF NOT EXISTS idx_daily_payment_schedule_agent ON daily_payment_schedule(agent_id);
CREATE INDEX IF NOT EXISTS idx_daily_payment_schedule_branch ON daily_payment_schedule(branch_id);
CREATE INDEX IF N