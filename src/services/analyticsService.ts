import { supabase } from './supabase';
import { DashboardStats } from '../types/disbursement';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export class AnalyticsService {
  /**
   * Get comprehensive branch analytics
   */
  static async getBranchAnalytics(branchId?: string) {
    try {
      // Get customers
      let customersQuery = supabase.from('customers').select('*');
      if (branchId) customersQuery = customersQuery.eq('branch_id', branchId);
      const { data: customers } = await customersQuery;

      // Get loans
      let loansQuery = supabase.from('loans').select('*');
      if (branchId) loansQuery = loansQuery.eq('branch_id', branchId);
      const { data: loans } = await loansQuery;

      // Get payments
      let paymentsQuery = supabase.from('payments').select('*');
      if (branchId) paymentsQuery = paymentsQuery.eq('branch_id', branchId);
      const { data: payments } = await paymentsQuery;

      const totalCustomers = customers?.length || 0;
      const totalLoans = loans?.length || 0;
      const activeLoans = loans?.filter(l => l.status === 'active').length || 0;
      const pendingLoans = loans?.filter(l => l.status === 'pending').length || 0;
      const approvedLoans = loans?.filter(l => l.status === 'approved').length || 0;
      const totalDisbursed = loans?.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.amount, 0) || 0;
      const totalCollected = payments?.reduce((sum, p) => sum + p.amount_paid, 0) || 0;
      const totalDue = payments?.reduce((sum, p) => sum + p.amount_due, 0) || 0;
      const collectionRate = totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;

      return {
        totalCustomers,
        totalLoans,
        activeLoans,
        pendingLoans,
        approvedLoans,
        totalDisbursed,
        totalCollected,
        totalDue,
        collectionRate: Math.round(collectionRate * 100) / 100,
      };
    } catch (error) {
      console.error('Analytics calculation error:', error);
      return null;
    }
  }



  /**
   * Get payment collection trends
   */
  static async getPaymentTrends(branchId?: string, days: number = 30) {
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
    
    let query = supabase
      .from('payments')
      .select('payment_date, amount_paid, amount_due, status')
      .gte('payment_date', startDate)
      .order('payment_date');
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Group by date
    const trends = data?.reduce((acc: any, payment) => {
      const date = payment.payment_date;
      if (!acc[date]) {
        acc[date] = { date, collected: 0, due: 0, rate: 0 };
      }
      acc[date].collected += payment.amount_paid;
      acc[date].due += payment.amount_due;
      acc[date].rate = acc[date].due > 0 ? (acc[date].collected / acc[date].due) * 100 : 0;
      return acc;
    }, {});

    return Object.values(trends || {});
  }

  /**
   * Get agent performance rankings
   */
  static async getAgentPerformance(branchId?: string) {
    let query = supabase
      .from('users')
      .select('id, full_name, phone')
      .eq('role', 'agent');
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data: agents, error } = await query;
    if (error) throw error;

    // Get performance data for each agent
    const performance = await Promise.all(
      agents?.map(async (agent) => {
        const [customers, loans, payments] = await Promise.all([
          supabase.from('customers').select('id').eq('agent_id', agent.id),
          supabase.from('loans').select('id, amount, status').eq('agent_id', agent.id),
          supabase.from('payments').select('amount_paid').eq('agent_id', agent.id)
        ]);

        const totalCustomers = customers.data?.length || 0;
        const totalLoans = loans.data?.length || 0;
        const approvedLoans = loans.data?.filter(l => l.status === 'approved').length || 0;
        const totalDisbursed = loans.data?.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.amount, 0) || 0;
        const totalCollected = payments.data?.reduce((sum, p) => sum + p.amount_paid, 0) || 0;

        return {
          ...agent,
          totalCustomers,
          totalLoans,
          approvedLoans,
          totalDisbursed,
          totalCollected,
          conversionRate: totalLoans > 0 ? (approvedLoans / totalLoans) * 100 : 0
        };
      }) || []
    );

    return performance.sort((a, b) => b.totalCollected - a.totalCollected);
  }

  /**
   * Get weekly collection summary
   */
  static async getWeeklyCollectionSummary(branchId?: string) {
    const startOfCurrentWeek = startOfWeek(new Date());
    const endOfCurrentWeek = endOfWeek(new Date());
    
    let query = supabase
      .from('payments')
      .select('payment_date, amount_paid, amount_due, status')
      .gte('payment_date', format(startOfCurrentWeek, 'yyyy-MM-dd'))
      .lte('payment_date', format(endOfCurrentWeek, 'yyyy-MM-dd'));
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const weeklyData = {
      monday: { collected: 0, due: 0, rate: 0 },
      tuesday: { collected: 0, due: 0, rate: 0 },
      wednesday: { collected: 0, due: 0, rate: 0 },
      thursday: { collected: 0, due: 0, rate: 0 },
      friday: { collected: 0, due: 0, rate: 0 },
      saturday: { collected: 0, due: 0, rate: 0 }
    };

    data?.forEach(payment => {
      const dayName = format(new Date(payment.payment_date), 'EEEE').toLowerCase();
      if (weeklyData[dayName as keyof typeof weeklyData]) {
        weeklyData[dayName as keyof typeof weeklyData].collected += payment.amount_paid;
        weeklyData[dayName as keyof typeof weeklyData].due += payment.amount_due;
      }
    });

    // Calculate rates
    Object.keys(weeklyData).forEach(day => {
      const dayData = weeklyData[day as keyof typeof weeklyData];
      dayData.rate = dayData.due > 0 ? (dayData.collected / dayData.due) * 100 : 0;
    });

    return weeklyData;
  }

  /**
   * Get branch KPIs
   */
  static async getBranchKPIs(branchId: string) {
    const { data: customers } = await supabase
      .from('customers')
      .select('id')
      .eq('branch_id', branchId);

    const { data: loans } = await supabase
      .from('loans')
      .select('id, amount, status')
      .eq('branch_id', branchId);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount_paid, amount_due')
      .eq('branch_id', branchId);

    const totalCustomers = customers?.length || 0;
    const activeLoans = loans?.filter(l => l.status === 'active').length || 0;
    const totalDisbursed = loans?.filter(l => l.status === 'active' || l.status === 'completed').reduce((sum, l) => sum + l.amount, 0) || 0;
    const totalCollected = payments?.reduce((sum, p) => sum + p.amount_paid, 0) || 0;
    const totalDue = payments?.reduce((sum, p) => sum + p.amount_due, 0) || 0;
    const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

    return {
      totalCustomers,
      activeLoans,
      totalDisbursed,
      totalCollected,
      collectionRate
    };
  }

  /**
   * Get collection trends
   */
  static async getCollectionTrends(branchId: string, timeRange: 'week' | 'month' | 'year') {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('payments')
      .select('payment_date, amount_paid')
      .eq('branch_id', branchId)
      .gte('payment_date', startDate)
      .order('payment_date');

    if (error) throw error;

    const trends = data?.reduce((acc: any, payment) => {
      const date = payment.payment_date;
      if (!acc[date]) {
        acc[date] = { date, amount: 0 };
      }
      acc[date].amount += payment.amount_paid;
      return acc;
    }, {});

    return Object.values(trends || {});
  }

  /**
   * Get loan trends
   */
  static async getLoanTrends(branchId: string, timeRange: 'week' | 'month' | 'year') {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('loans')
      .select('application_date, amount')
      .eq('branch_id', branchId)
      .gte('application_date', startDate)
      .order('application_date');

    if (error) throw error;

    const trends = data?.reduce((acc: any, loan) => {
      const date = format(new Date(loan.application_date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, count: 0, amount: 0 };
      }
      acc[date].count += 1;
      acc[date].amount += loan.amount;
      return acc;
    }, {});

    return Object.values(trends || {});
  }

  /**
   * Get real-time dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if view doesn't exist yet
      return {
        total_users: 0,
        total_agents: 0,
        total_customers: 0,
        active_loans: 0,
        total_active_loan_amount: 0,
        total_collected: 0,
        total_disbursed: 0,
        collection_rate: 0,
      };
    }

    return data;
  }

  /**
   * Get total disbursed by period
   */
  static async getTotalDisbursedByPeriod(
    branchId?: string,
    period: 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<{ weekly: number; monthly: number; yearly: number }> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    let query = supabase.from('loans').select('amount');

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    query = query.eq('status', 'disbursed');

    // Weekly
    const { data: weeklyData } = await query
      .gte('approval_date', weekAgo.toISOString())
      .select('amount');

    // Monthly
    const { data: monthlyData } = await query
      .gte('approval_date', monthAgo.toISOString())
      .select('amount');

    // Yearly
    const { data: yearlyData } = await query
      .gte('approval_date', yearAgo.toISOString())
      .select('amount');

    return {
      weekly: weeklyData?.reduce((sum, l) => sum + Number(l.amount), 0) || 0,
      monthly: monthlyData?.reduce((sum, l) => sum + Number(l.amount), 0) || 0,
      yearly: yearlyData?.reduce((sum, l) => sum + Number(l.amount), 0) || 0,
    };
  }

  /**
   * Export report data
   */
  static async generateReport(
    reportType: 'loans' | 'payments' | 'customers' | 'disbursements',
    filters?: any
  ): Promise<any[]> {
    let query;

    switch (reportType) {
      case 'loans':
        query = supabase.from('loans').select(`
          *,
          customer:customers(full_name, phone),
          agent:users!loans_agent_id_fkey(full_name),
          branch:branches(name)
        `);
        break;
      case 'payments':
        query = supabase.from('payments').select(`
          *,
          loan:loans(amount, customer:customers(full_name))
        `);
        break;
      case 'customers':
        query = supabase.from('customers').select(`
          *,
          agent:users(full_name),
          branch:branches(name)
        `);
        break;
      case 'disbursements':
        query = supabase.from('disbursements').select(`
          *,
          agent:users!disbursements_agent_id_fkey(full_name),
          disbursed_by_user:users!disbursements_disbursed_by_fkey(full_name)
        `);
        break;
      default:
        throw new Error('Invalid report type');
    }

    if (filters?.branch_id) {
      query = query.eq('branch_id', filters.branch_id);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }
}
