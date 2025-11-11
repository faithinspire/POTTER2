import { supabase } from './supabase';
import { Disbursement, DisbursementWithDetails } from '../types/disbursement';

export class DisbursementService {
  /**
   * Create a new disbursement to an agent
   */
  static async createDisbursement(data: {
    branch_id: string;
    agent_id: string;
    amount: number;
    disbursed_by: string;
    period_type: 'daily' | 'weekly';
    notes?: string;
  }): Promise<Disbursement> {
    const { data: disbursement, error } = await supabase
      .from('disbursements')
      .insert({
        ...data,
        disbursement_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    return disbursement;
  }

  /**
   * Get disbursements for a branch
   */
  static async getDisbursementsByBranch(branchId: string): Promise<DisbursementWithDetails[]> {
    const { data, error } = await supabase
      .from('disbursements')
      .select(`
        *,
        agent:agent_id(full_name),
        disbursed_by_user:disbursed_by(full_name)
      `)
      .eq('branch_id', branchId)
      .order('disbursement_date', { ascending: false });

    if (error) throw error;

    return data.map((d: any) => ({
      ...d,
      agent_name: d.agent?.full_name || 'Unknown',
      disbursed_by_name: d.disbursed_by_user?.full_name || 'Unknown',
    }));
  }

  /**
   * Get total disbursed to an agent
   */
  static async getAgentTotalDisbursed(agentId: string): Promise<number> {
    const { data, error } = await supabase
      .from('disbursements')
      .select('amount')
      .eq('agent_id', agentId);

    if (error) throw error;

    return data.reduce((sum, d) => sum + Number(d.amount), 0);
  }

  /**
   * Get disbursements by period
   */
  static async getDisbursementsByPeriod(
    branchId: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Promise<{ total: number; count: number }> {
    let query = supabase
      .from('disbursements')
      .select('amount')
      .eq('branch_id', branchId);

    if (startDate) {
      query = query.gte('disbursement_date', startDate);
    }
    if (endDate) {
      query = query.lte('disbursement_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = data.reduce((sum, d) => sum + Number(d.amount), 0);
    return { total, count: data.length };
  }
}
