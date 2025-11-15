-- Migration: Enhanced Customer Features and Analytics
-- This migration adds support for:
-- 1. Customer photos and additional fields
-- 2. Daily payment tracking
-- 3. Agent performance metrics
-- 4. Branch analytics

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
CREATE INDEX IF NOT EXISTS idx_daily_payment_schedule_due_date ON daily_payment_schedule(due_date);
CREATE INDEX IF NOT EXISTS idx_daily_payment_schedule_status ON daily_payment_schedule(status);

-- Create agent_performance_metrics table for tracking agent KPIs
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    customers_registered INTEGER DEFAULT 0,
    loans_processed INTEGER DEFAULT 0,
    payments_collected INTEGER DEFAULT 0,
    total_amount_collected DECIMAL(15,2) DEFAULT 0,
    total_amount_disbursed DECIMAL(15,2) DEFAULT 0,
    collection_rate DECIMAL(5,2) DEFAULT 0,
    customer_satisfaction_score DECIMAL(3,2) DEFAULT 0,
    performance_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, metric_date)
);

-- Create indexes for agent performance metrics
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent ON agent_performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_branch ON agent_performance_metrics(branch_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_date ON agent_performance_metrics(metric_date);

-- Create branch_analytics table for branch-level insights
CREATE TABLE IF NOT EXISTS branch_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    analytics_date DATE NOT NULL,
    total_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    active_loans INTEGER DEFAULT 0,
    completed_loans INTEGER DEFAULT 0,
    overdue_loans INTEGER DEFAULT 0,
    total_disbursed DECIMAL(15,2) DEFAULT 0,
    total_collected DECIMAL(15,2) DEFAULT 0,
    collection_rate DECIMAL(5,2) DEFAULT 0,
    agent_count INTEGER DEFAULT 0,
    avg_loan_amount DECIMAL(15,2) DEFAULT 0,
    customer_retention_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, analytics_date)
);

-- Create indexes for branch analytics
CREATE INDEX IF NOT EXISTS idx_branch_analytics_branch ON branch_analytics(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_analytics_date ON branch_analytics(analytics_date);

-- Create customer_interactions table for tracking customer touchpoints
CREATE TABLE IF NOT EXISTS customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('registration', 'loan_application', 'payment', 'follow_up', 'complaint', 'inquiry')),
    interaction_method VARCHAR(30) CHECK (interaction_method IN ('in_person', 'phone', 'sms', 'email', 'whatsapp')),
    description TEXT,
    outcome VARCHAR(100),
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for customer interactions
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_agent ON customer_interactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_type ON customer_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_date ON customer_interactions(created_at);

-- Create payment_reminders table for automated reminder system
CREATE TABLE IF NOT EXISTS payment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) CHECK (reminder_type IN ('sms', 'call', 'visit', 'email')),
    reminder_date DATE NOT NULL,
    due_amount DECIMAL(15,2) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for payment reminders
CREATE INDEX IF NOT EXISTS idx_payment_reminders_customer ON payment_reminders(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_loan ON payment_reminders(loan_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_agent ON payment_reminders(agent_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_date ON payment_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_status ON payment_reminders(status);

-- Create function to calculate daily payment schedules
CREATE OR REPLACE FUNCTION generate_daily_payment_schedule(
    p_loan_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_daily_amount DECIMAL(15,2)
) RETURNS VOID AS $$
DECLARE
    loan_record RECORD;
    current_payment_date DATE;
BEGIN
    -- Get loan details
    SELECT l.*, c.agent_id, c.branch_id 
    INTO loan_record 
    FROM loans l 
    JOIN customers c ON l.customer_id = c.id 
    WHERE l.id = p_loan_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Loan not found: %', p_loan_id;
    END IF;
    
    -- Generate daily payment schedule
    current_payment_date := p_start_date;
    WHILE current_payment_date <= p_end_date LOOP
        -- Skip Sundays (assuming Sunday = 0)
        IF EXTRACT(DOW FROM current_payment_date) != 0 THEN
            INSERT INTO daily_payment_schedule (
                customer_id,
                loan_id,
                agent_id,
                branch_id,
                expected_amount,
                due_date,
                payment_type
            ) VALUES (
                loan_record.customer_id,
                p_loan_id,
                loan_record.agent_id,
                loan_record.branch_id,
                p_daily_amount,
                current_payment_date,
                'daily'
            ) ON CONFLICT DO NOTHING;
        END IF;
        
        current_payment_date := current_payment_date + INTERVAL '1 day';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to update agent performance metrics
CREATE OR REPLACE FUNCTION update_agent_performance_metrics(p_agent_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    agent_record RECORD;
    metrics RECORD;
    collection_rate DECIMAL(5,2) := 0;
    performance_score DECIMAL(5,2) := 0;
BEGIN
    -- Get agent details
    SELECT * INTO agent_record FROM users WHERE id = p_agent_id AND role = 'agent';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agent not found: %', p_agent_id;
    END IF;
    
    -- Calculate metrics for the date
    SELECT 
        COUNT(DISTINCT c.id) as customers_registered,
        COUNT(DISTINCT l.id) as loans_processed,
        COUNT(DISTINCT p.id) as payments_collected,
        COALESCE(SUM(p.amount), 0) as total_amount_collected,
        COALESCE(SUM(l.principal_amount), 0) as total_amount_disbursed
    INTO metrics
    FROM customers c
    LEFT JOIN loans l ON c.id = l.customer_id AND DATE(l.created_at) = p_date
    LEFT JOIN payments p ON c.id = p.customer_id AND DATE(p.created_at) = p_date
    WHERE c.agent_id = p_agent_id
    AND DATE(c.created_at) = p_date;
    
    -- Calculate collection rate
    IF metrics.total_amount_disbursed > 0 THEN
        collection_rate := (metrics.total_amount_collected / metrics.total_amount_disbursed) * 100;
    END IF;
    
    -- Calculate performance score (0-100)
    performance_score := LEAST(100, 
        (metrics.customers_registered * 10) + 
        (metrics.loans_processed * 15) + 
        (metrics.payments_collected * 5) + 
        (collection_rate * 0.5)
    );
    
    -- Insert or update metrics
    INSERT INTO agent_performance_metrics (
        agent_id,
        branch_id,
        metric_date,
        customers_registered,
        loans_processed,
        payments_collected,
        total_amount_collected,
        total_amount_disbursed,
        collection_rate,
        performance_score
    ) VALUES (
        p_agent_id,
        agent_record.branch_id,
        p_date,
        metrics.customers_registered,
        metrics.loans_processed,
        metrics.payments_collected,
        metrics.total_amount_collected,
        metrics.total_amount_disbursed,
        collection_rate,
        performance_score
    ) ON CONFLICT (agent_id, metric_date) 
    DO UPDATE SET
        customers_registered = EXCLUDED.customers_registered,
        loans_processed = EXCLUDED.loans_processed,
        payments_collected = EXCLUDED.payments_collected,
        total_amount_collected = EXCLUDED.total_amount_collected,
        total_amount_disbursed = EXCLUDED.total_amount_disbursed,
        collection_rate = EXCLUDED.collection_rate,
        performance_score = EXCLUDED.performance_score,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to update branch analytics
CREATE OR REPLACE FUNCTION update_branch_analytics(p_branch_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    analytics RECORD;
    collection_rate DECIMAL(5,2) := 0;
BEGIN
    -- Calculate branch analytics for the date
    SELECT 
        COUNT(DISTINCT c.id) as total_customers,
        COUNT(DISTINCT CASE WHEN DATE(c.created_at) = p_date THEN c.id END) as new_customers,
        COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_loans,
        COUNT(DISTINCT CASE WHEN l.status = 'completed' THEN l.id END) as completed_loans,
        COUNT(DISTINCT CASE WHEN l.status = 'overdue' THEN l.id END) as overdue_loans,
        COALESCE(SUM(l.principal_amount), 0) as total_disbursed,
        COALESCE(SUM(p.amount), 0) as total_collected,
        COUNT(DISTINCT u.id) as agent_count,
        COALESCE(AVG(l.principal_amount), 0) as avg_loan_amount
    INTO analytics
    FROM branches b
    LEFT JOIN customers c ON b.id = c.branch_id
    LEFT JOIN loans l ON c.id = l.customer_id
    LEFT JOIN payments p ON c.id = p.customer_id
    LEFT JOIN users u ON b.id = u.branch_id AND u.role = 'agent'
    WHERE b.id = p_branch_id
    GROUP BY b.id;
    
    -- Calculate collection rate
    IF analytics.total_disbursed > 0 THEN
        collection_rate := (analytics.total_collected / analytics.total_disbursed) * 100;
    END IF;
    
    -- Insert or update analytics
    INSERT INTO branch_analytics (
        branch_id,
        analytics_date,
        total_customers,
        new_customers,
        active_loans,
        completed_loans,
        overdue_loans,
        total_disbursed,
        total_collected,
        collection_rate,
        agent_count,
        avg_loan_amount
    ) VALUES (
        p_branch_id,
        p_date,
        analytics.total_customers,
        analytics.new_customers,
        analytics.active_loans,
        analytics.completed_loans,
        analytics.overdue_loans,
        analytics.total_disbursed,
        analytics.total_collected,
        collection_rate,
        analytics.agent_count,
        analytics.avg_loan_amount
    ) ON CONFLICT (branch_id, analytics_date)
    DO UPDATE SET
        total_customers = EXCLUDED.total_customers,
        new_customers = EXCLUDED.new_customers,
        active_loans = EXCLUDED.active_loans,
        completed_loans = EXCLUDED.completed_loans,
        overdue_loans = EXCLUDED.overdue_loans,
        total_disbursed = EXCLUDED.total_disbursed,
        total_collected = EXCLUDED.total_collected,
        collection_rate = EXCLUDED.collection_rate,
        agent_count = EXCLUDED.agent_count,
        avg_loan_amount = EXCLUDED.avg_loan_amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update metrics
CREATE OR REPLACE FUNCTION trigger_update_metrics() RETURNS TRIGGER AS $$
BEGIN
    -- Update agent performance metrics
    IF TG_TABLE_NAME = 'customers' THEN
        PERFORM update_agent_performance_metrics(NEW.agent_id, DATE(NEW.created_at));
        PERFORM update_branch_analytics(NEW.branch_id, DATE(NEW.created_at));
    ELSIF TG_TABLE_NAME = 'loans' THEN
        PERFORM update_agent_performance_metrics(NEW.agent_id, DATE(NEW.created_at));
        PERFORM update_branch_analytics(NEW.branch_id, DATE(NEW.created_at));
    ELSIF TG_TABLE_NAME = 'payments' THEN
        PERFORM update_agent_performance_metrics(NEW.agent_id, DATE(NEW.created_at));
        PERFORM update_branch_analytics(NEW.branch_id, DATE(NEW.created_at));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_customer_metrics') THEN
        CREATE TRIGGER trigger_customer_metrics
            AFTER INSERT ON customers
            FOR EACH ROW EXECUTE FUNCTION trigger_update_metrics();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_loan_metrics') THEN
        CREATE TRIGGER trigger_loan_metrics
            AFTER INSERT ON loans
            FOR EACH ROW EXECUTE FUNCTION trigger_update_metrics();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_payment_metrics') THEN
        CREATE TRIGGER trigger_payment_metrics
            AFTER INSERT ON payments
            FOR EACH ROW EXECUTE FUNCTION trigger_update_metrics();
    END IF;
END $$;

-- Create view for daily payment tracking
CREATE OR REPLACE VIEW daily_payments_view AS
SELECT 
    dps.id,
    dps.due_date,
    dps.expected_amount,
    dps.actual_amount,
    dps.status,
    dps.payment_date,
    c.full_name as customer_name,
    c.phone_number as customer_phone,
    c.photo_url as customer_photo,
    u.full_name as agent_name,
    b.name as branch_name,
    l.principal_amount as loan_amount,
    l.interest_amount as loan_interest
FROM daily_payment_schedule dps
JOIN customers c ON dps.customer_id = c.id
JOIN users u ON dps.agent_id = u.id
JOIN branches b ON dps.branch_id = b.id
JOIN loans l ON dps.loan_id = l.id
ORDER BY dps.due_date DESC, dps.created_at DESC;

-- Create view for agent performance dashboard
CREATE OR REPLACE VIEW agent_performance_view AS
SELECT 
    u.id as agent_id,
    u.full_name as agent_name,
    u.email as agent_email,
    b.name as branch_name,
    apm.metric_date,
    apm.customers_registered,
    apm.loans_processed,
    apm.payments_collected,
    apm.total_amount_collected,
    apm.total_amount_disbursed,
    apm.collection_rate,
    apm.performance_score,
    RANK() OVER (PARTITION BY apm.metric_date ORDER BY apm.performance_score DESC) as performance_rank
FROM users u
JOIN branches b ON u.branch_id = b.id
LEFT JOIN agent_performance_metrics apm ON u.id = apm.agent_id
WHERE u.role = 'agent'
ORDER BY apm.metric_date DESC, apm.performance_score DESC;

-- Create view for branch analytics dashboard
CREATE OR REPLACE VIEW branch_analytics_view AS
SELECT 
    b.id as branch_id,
    b.name as branch_name,
    ba.analytics_date,
    ba.total_customers,
    ba.new_customers,
    ba.active_loans,
    ba.completed_loans,
    ba.overdue_loans,
    ba.total_disbursed,
    ba.total_collected,
    ba.collection_rate,
    ba.agent_count,
    ba.avg_loan_amount,
    CASE 
        WHEN ba.collection_rate >= 90 THEN 'excellent'
        WHEN ba.collection_rate >= 75 THEN 'good'
        WHEN ba.collection_rate >= 60 THEN 'average'
        ELSE 'poor'
    END as performance_rating
FROM branches b
LEFT JOIN branch_analytics ba ON b.id = ba.branch_id
ORDER BY ba.analytics_date DESC, ba.collection_rate DESC;

-- Enable RLS on new tables
ALTER TABLE daily_payment_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_payment_schedule
CREATE POLICY "Users can view daily payment schedule for their branch" ON daily_payment_schedule
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Agents can update their daily payment schedule" ON daily_payment_schedule
    FOR UPDATE USING (
        agent_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'subadmin')
            AND branch_id = daily_payment_schedule.branch_id
        )
    );

-- Create RLS policies for agent_performance_metrics
CREATE POLICY "Users can view agent performance for their branch" ON agent_performance_metrics
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        ) OR
        agent_id = auth.uid()
    );

-- Create RLS policies for branch_analytics
CREATE POLICY "Users can view branch analytics for their branch" ON branch_analytics
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create RLS policies for customer_interactions
CREATE POLICY "Users can manage customer interactions for their branch" ON customer_interactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customers c
            JOIN users u ON c.branch_id = u.branch_id
            WHERE c.id = customer_interactions.customer_id
            AND u.id = auth.uid()
        )
    );

-- Create RLS policies for payment_reminders
CREATE POLICY "Users can manage payment reminders for their branch" ON payment_reminders
    FOR ALL USING (
        agent_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM customers c
            JOIN users u ON c.branch_id = u.branch_id
            WHERE c.id = payment_reminders.customer_id
            AND u.id = auth.uid()
            AND u.role IN ('admin', 'subadmin')
        )
    );

-- Insert sample data for testing (optional)
-- This will be populated by the application as users interact with the system

COMMENT ON TABLE daily_payment_schedule IS 'Tracks expected daily payments for each loan';
COMMENT ON TABLE agent_performance_metrics IS 'Stores daily performance metrics for each agent';
COMMENT ON TABLE branch_analytics IS 'Stores daily analytics data for each branch';
COMMENT ON TABLE customer_interactions IS 'Logs all interactions between agents and customers';
COMMENT ON TABLE payment_reminders IS 'Manages automated payment reminders to customers';