import { supabase } from './supabase';
import { UserProfile } from '../types/user';

export class UserService {
  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        branch:branches(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
      branch_name: user.branch?.name || null,
      full_name: user.full_name,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }

  /**
   * Get users by branch
   */
  static async getUsersByBranch(branchId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        branch:branches(id, name)
      `)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
      branch_name: user.branch?.name || null,
      full_name: user.full_name,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }

  /**
   * Create new user profile (after auth user is created)
   */
  static async createUserProfile(userData: {
    id: string;
    email: string;
    role: 'admin' | 'subadmin' | 'agent';
    branch_id?: string;
    full_name: string;
    phone: string;
  }): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select(`
        *,
        branch:branches(id, name)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      role: data.role,
      branch_id: data.branch_id,
      branch_name: data.branch?.name || null,
      full_name: data.full_name,
      phone: data.phone,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Update user profile
   */
  static async updateUser(
    userId: string,
    updates: Partial<Pick<UserProfile, 'full_name' | 'phone' | 'role' | 'branch_id'>>
  ): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    const { data, error } = await supabase
      .from('users')
      .select('role, branch_id');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      admins: data?.filter(u => u.role === 'admin').length || 0,
      subadmins: data?.filter(u => u.role === 'subadmin').length || 0,
      agents: data?.filter(u => u.role === 'agent').length || 0,
      igando: data?.filter(u => u.branch_id && u.role !== 'admin').length || 0,
      abuleegba: data?.filter(u => u.branch_id && u.role !== 'admin').length || 0,
    };

    return stats;
  }

  /**
   * Get agent performance metrics
   */
  static async getAgentPerformance(branchId: string) {
    // Get agents in branch
    const { data: agents, error: agentsError } = await supabase
      .from('users')
      .select('id, full_name, email, phone')
      .eq('branch_id', branchId)
      .eq('role', 'agent');

    if (agentsError) throw agentsError;

    // Get performance metrics for each agent
    const agentMetrics = await Promise.all(
      (agents || []).map(async (agent) => {
        // Count customers
        const { count: customerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', agent.id);

        // Count loans
        const { count: loanCount } = await supabase
          .from('loans')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', agent.id);

        // Count active loans
        const { count: activeLoans } = await supabase
          .from('loans')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', agent.id)
          .eq('status', 'active');

        // Calculate total collections
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('agent_id', agent.id)
          .eq('status', 'paid');

        const totalCollections = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

        // Calculate collection rate
        const { count: totalPayments } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', agent.id);

        const { count: paidPayments } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', agent.id)
          .eq('status', 'paid');

        const collectionRate = totalPayments ? ((paidPayments || 0) / totalPayments) * 100 : 0;

        return {
          ...agent,
          customers: customerCount || 0,
          loans: loanCount || 0,
          activeLoans: activeLoans || 0,
          totalCollections,
          collectionRate: Math.round(collectionRate),
        };
      })
    );

    return agentMetrics;
  }

  /**
   * Delete a user (Admin and Sub-Admin only)
   */
  static async deleteUser(userId: string): Promise<void> {
    // Delete from public.users first
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) throw userError;

    // Delete from auth.users (requires admin privileges)
    // This will cascade delete due to foreign key
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Auth delete error:', authError);
      // Don't throw - user is already deleted from public.users
    }
  }
}
