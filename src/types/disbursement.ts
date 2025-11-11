export interface Disbursement {
  id: string;
  branch_id: string;
  agent_id: string;
  amount: number;
  disbursed_by: string;
  disbursement_date: string;
  period_type: 'daily' | 'weekly';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DisbursementWithDetails extends Disbursement {
  agent_name: string;
  disbursed_by_name: string;
}

export interface DashboardStats {
  total_users: number;
  total_agents: number;
  total_customers: number;
  active_loans: number;
  total_active_loan_amount: number;
  total_collected: number;
  total_disbursed: number;
  collection_rate: number;
}
