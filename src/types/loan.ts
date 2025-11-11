export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';

export interface Loan {
  id: string;
  customer_id: string;
  agent_id: string;
  branch_id: string;
  subadmin_id: string;
  amount: number;
  interest_rate: number;
  duration_weeks: number;
  duration_days?: number;
  weekly_payment: number;
  daily_payment?: number;
  status: LoanStatus;
  application_date: string;
  approval_date: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanWithDetails extends Loan {
  customer_name: string;
  agent_name: string;
  branch_name: string;
}
