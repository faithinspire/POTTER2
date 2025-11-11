import { supabase } from './supabase';
import { Loan, LoanWithDetails } from '../types/loan';

export class LoanService {
  /**
   * Calculate weekly payment
   */
  static calculateWeeklyPayment(amount: number, interestRate: number, durationWeeks: number): number {
    const totalAmount = amount * (1 + interestRate / 100);
    const weeklyPayment = totalAmount / durationWeeks;
    return Math.round(weeklyPayment * 100) / 100;
  }

  /**
   * Create a new loan application
   */
  static async createLoan(loanData: {
    customer_id: string;
    agent_id: string;
    branch_id: string;
    amount: number;
    interest_rate: number;
    duration_weeks: number;
  }): Promise<Loan> {
    const weekly_payment = this.calculateWeeklyPayment(
      loanData.amount,
      loanData.interest_rate,
      loanData.duration_weeks
    );

    // Get subadmin for the branch
    const { data: subadmin } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'subadmin')
      .eq('branch_id', loanData.branch_id)
      .single();

    const { data, error } = await supabase
      .from('loans')
      .insert({
        ...loanData,
        weekly_payment,
        subadmin_id: subadmin?.id || loanData.agent_id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get loans by agent
   */
  static async getLoansByAgent(agentId: string): Promise<LoanWithDetails[]> {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        customer:customers(full_name, phone),
        agent:users!loans_agent_id_fkey(full_name),
        branch:branches(name)
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(loan => ({
      ...loan,
      customer_name: loan.customer?.full_name || '',
      agent_name: loan.agent?.full_name || '',
      branch_name: loan.branch?.name || '',
    }));
  }

  /**
   * Get pending loans for sub-admin
   */
  static async getPendingLoansByBranch(branchId: string): Promise<LoanWithDetails[]> {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        customer:customers(full_name, phone, address),
        agent:users!loans_agent_id_fkey(full_name),
        branch:branches(name)
      `)
      .eq('branch_id', branchId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(loan => ({
      ...loan,
      customer_name: loan.customer?.full_name || '',
      agent_name: loan.agent?.full_name || '',
      branch_name: loan.branch?.name || '',
    }));
  }

  /**
   * Approve loan
   */
  static async approveLoan(loanId: string, approvedBy: string): Promise<void> {
    const { error } = await supabase
      .from('loans')
      .update({
        status: 'approved',
        approval_date: new Date().toISOString(),
        approved_by: approvedBy,
      })
      .eq('id', loanId);

    if (error) throw error;
  }

  /**
   * Reject loan
   */
  static async rejectLoan(loanId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('loans')
      .update({
        status: 'rejected',
        rejection_reason: reason,
      })
      .eq('id', loanId);

    if (error) throw error;
  }

  /**
   * Get all loans (admin)
   */
  static async getAllLoans(): Promise<LoanWithDetails[]> {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        customer:customers(full_name, phone),
        agent:users!loans_agent_id_fkey(full_name),
        branch:branches(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(loan => ({
      ...loan,
      customer_name: loan.customer?.full_name || '',
      agent_name: loan.agent?.full_name || '',
      branch_name: loan.branch?.name || '',
    }));
  }
}
