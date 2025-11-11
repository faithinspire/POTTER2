-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    entity_type TEXT,
    entity_id TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table for file uploads
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_branch_id ON audit_logs(branch_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_branch_id ON documents(branch_id);

-- Enable RLS on new tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Users can view audit logs for their branch" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (
                users.role = 'admin' OR 
                (users.role = 'subadmin' AND users.branch_id = audit_logs.branch_id) OR
                (users.role = 'agent' AND users.id = audit_logs.user_id)
            )
        )
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for documents
CREATE POLICY "Users can view documents for their branch" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (
                users.role = 'admin' OR 
                users.branch_id = documents.branch_id
            )
        )
    );

CREATE POLICY "Users can insert documents for their branch" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.branch_id = branch_id
        )
    );

CREATE POLICY "Users can update documents they uploaded" ON documents
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete documents they uploaded" ON documents
    FOR DELETE USING (uploaded_by = auth.uid());

-- Create function to automatically log certain actions
CREATE OR REPLACE FUNCTION log_customer_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, new_values, branch_id)
        SELECT 
            auth.uid(),
            users.full_name,
            'customer_created',
            'customer',
            NEW.id::text,
            to_jsonb(NEW),
            NEW.branch_id
        FROM users WHERE users.id = auth.uid();
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, old_values, new_values, branch_id)
        SELECT 
            auth.uid(),
            users.full_name,
            'customer_updated',
            'customer',
            NEW.id::text,
            to_jsonb(OLD),
            to_jsonb(NEW),
            NEW.branch_id
        FROM users WHERE users.id = auth.uid();
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, old_values, branch_id)
        SELECT 
            auth.uid(),
            users.full_name,
            'customer_deleted',
            'customer',
            OLD.id::text,
            to_jsonb(OLD),
            OLD.branch_id
        FROM users WHERE users.id = auth.uid();
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically log loan changes
CREATE OR REPLACE FUNCTION log_loan_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, new_values, branch_id)
        SELECT 
            auth.uid(),
            users.full_name,
            'loan_applied',
            'loan',
            NEW.id::text,
            to_jsonb(NEW),
            NEW.branch_id
        FROM users WHERE users.id = auth.uid();
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Determine the action based on status change
        DECLARE
            action_type TEXT := 'loan_updated';
        BEGIN
            IF OLD.status != NEW.status THEN
                IF NEW.status = 'approved' THEN
                    action_type := 'loan_approved';
                ELSIF NEW.status = 'rejected' THEN
                    action_type := 'loan_rejected';
                END IF;
            END IF;
            
            INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, old_values, new_values, branch_id)
            SELECT 
                auth.uid(),
                users.full_name,
                action_type,
                'loan',
                NEW.id::text,
                to_jsonb(OLD),
                to_jsonb(NEW),
                NEW.branch_id
            FROM users WHERE users.id = auth.uid();
        END;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically log payment changes
CREATE OR REPLACE FUNCTION log_payment_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, new_values, branch_id)
        SELECT 
            auth.uid(),
            users.full_name,
            'payment_recorded',
            'payment',
            NEW.id::text,
            to_jsonb(NEW),
            NEW.branch_id
        FROM users WHERE users.id = auth.uid();
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, old_values, new_values, branch_id)
        SELECT 
            auth.uid(),
            users.full_name,
            'payment_updated',
            'payment',
            NEW.id::text,
            to_jsonb(OLD),
            to_jsonb(NEW),
            NEW.branch_id
        FROM users WHERE users.id = auth.uid();
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic audit logging
DROP TRIGGER IF EXISTS customer_audit_trigger ON customers;
CREATE TRIGGER customer_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION log_customer_changes();

DROP TRIGGER IF EXISTS loan_audit_trigger ON loans;
CREATE TRIGGER loan_audit_trigger
    AFTER INSERT OR UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION log_loan_changes();

DROP TRIGGER IF EXISTS payment_audit_trigger ON payments;
CREATE TRIGGER payment_audit_trigger
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION log_payment_changes();

-- Create function for analytics (if not exists)
CREATE OR REPLACE FUNCTION get_branch_analytics(branch_filter UUID DEFAULT NULL)
RETURNS TABLE (
    total_customers BIGINT,
    total_loans BIGINT,
    active_loans BIGINT,
    pending_loans BIGINT,
    approved_loans BIGINT,
    total_disbursed NUMERIC,
    total_collected NUMERIC,
    total_due NUMERIC,
    collection_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM customers WHERE branch_filter IS NULL OR branch_id = branch_filter) as total_customers,
        (SELECT COUNT(*) FROM loans WHERE branch_filter IS NULL OR branch_id = branch_filter) as total_loans,
        (SELECT COUNT(*) FROM loans WHERE status = 'active' AND (branch_filter IS NULL OR branch_id = branch_filter)) as active_loans,
        (SELECT COUNT(*) FROM loans WHERE status = 'pending' AND (branch_filter IS NULL OR branch_id = branch_filter)) as pending_loans,
        (SELECT COUNT(*) FROM loans WHERE status = 'approved' AND (branch_filter IS NULL OR branch_id = branch_filter)) as approved_loans,
        (SELECT COALESCE(SUM(amount), 0) FROM loans WHERE status = 'approved' AND (branch_filter IS NULL OR branch_id = branch_filter)) as total_disbursed,
        (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE branch_filter IS NULL OR branch_id = branch_filter) as total_collected,
        (SELECT COALESCE(SUM(amount_due), 0) FROM payments WHERE branch_filter IS NULL OR branch_id = branch_filter) as total_due,
        (SELECT 
            CASE 
                WHEN COALESCE(SUM(amount_due), 0) > 0 
                THEN (COALESCE(SUM(amount_paid), 0) / COALESCE(SUM(amount_due), 1)) * 100 
                ELSE 0 
            END 
         FROM payments WHERE branch_filter IS NULL OR branch_id = branch_filter) as collection_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;