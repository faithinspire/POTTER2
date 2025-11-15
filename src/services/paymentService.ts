import { supabase } from './supabase';
import { Payment, PaymentCell } from '../types/payment';
import { format, startOfWeek, addDays } from 'date-fns';

export class PaymentService {
  /**
   * Record a payment
   */
  static async recordPayment(paymentData: {
    loan_id: string;
    customer_id: string;
    agent_id: string;
    branch_id: string;
    amount_due: number;
    amount_paid: number;
    payment_date: string;
    notes?: string;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .upsert({
        ...paymentData,
        status: paymentData.amount_paid >= paymentData.amount_due ? 'paid' : 
                paymentData.amount_paid > 0 ? 'partial' : 'unpaid',
      }, {
        onConflict: 'loan_id,payment_date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get weekly payments for agent
   */
  static async getWeeklyPayments(
    agentId: string,
    weekStart: Date
  ): Promise<PaymentCell[]> {
    const weekEnd = addDays(weekStart, 6);

    // Get active loans for agent (approved or active status)
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select(`
        id,
        customer_id,
        weekly_payment,
        amount,
        customers(full_name)
      `)
      .eq('agent_id', agentId)
      .in('status', ['approved', 'active'])
      .order('created_at', { ascending: false });

    if (loansError) throw loansError;

    // Get payments for the week
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('agent_id', agentId)
      .gte('payment_date', format(weekStart, 'yyyy-MM-dd'))
      .lte('payment_date', format(weekEnd, 'yyyy-MM-dd'));

    if (paymentsError) throw paymentsError;

    // Create payment cells for each loan and each day
    const cells: PaymentCell[] = [];
    
    loans?.forEach(loan => {
      for (let i = 0; i < 6; i++) { // Mon-Sat
        const date = addDays(weekStart, i);
        const payment = payments?.find(
          p => p.loan_id === loan.id && p.payment_date === format(date, 'yyyy-MM-dd')
        );

        cells.push({
          customer_id: loan.customer_id,
          customer_name: (loan.customers as any)?.full_name || '',
          loan_id: loan.id,
          date,
          amount_due: loan.weekly_payment,
          amount_paid: payment?.amount_paid || 0,
          status: payment?.status || 'unpaid',
          payment_id: payment?.id || null,
        });
      }
    });

    return cells;
  }

  /**
   * Get payments by branch
   */
  static async getPaymentsByBranch(
    branchId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Payment[]> {
    let query = supabase
      .from('payments')
      .select('*')
      .eq('branch_id', branchId)
      .order('payment_date', { ascending: false });

    if (startDate) {
      query = query.gte('payment_date', startDate);
    }
    if (endDate) {
      query = query.lte('payment_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats(agentId: string, date: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('amount_paid, status')
      .eq('agent_id', agentId)
      .eq('payment_date', date);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      paid: data?.filter(p => p.status === 'paid').length || 0,
      amount: data?.reduce((sum, p) => sum + p.amount_paid, 0) || 0,
    };

    return stats;
  }

  /**
   * Get daily payments for tracking
   */
  static async getDailyPayments(date: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('daily_payments_view')
      .select('*')
      .eq('due_date', date)
      .order('customer_name', { ascending: true });

    if (error) {
      console.error('Error fetching daily payments:', error);
      // Fallback to manual query if view doesn't exist
      return this.getDailyPaymentsFallback(date);
    }

    return data || [];
  }

  /**
   * Fallback method for daily payments if view doesn't exist
   */
  private static async getDailyPaymentsFallback(date: string): Promise<any[]> {
    const { data: schedules, error } = await supabase
      .from('daily_payment_schedule')
      .select(`
        *,
        customers!inner(full_name, phone_number, photo_url),
        users!inner(full_name),
        branches!inner(name),
        loans!inner(principal_amount, interest_amount)
      `)
      .eq('due_date', date);

    if (error) throw error;

    return (schedules || []).map(schedule => ({
      id: schedule.id,
      due_date: schedule.due_date,
      expected_amount: schedule.expected_amount,
      actual_amount: schedule.actual_amount,
      status: schedule.status,
      payment_date: schedule.payment_date,
      customer_name: schedule.customers.full_name,
      customer_phone: schedule.customers.phone_number,
      customer_photo: schedule.customers.photo_url,
      agent_name: schedule.users.full_name,
      branch_name: schedule.branches.name,
      loan_amount: schedule.loans.principal_amount,
      loan_interest: schedule.loans.interest_amount
    }));
  }

  /**
   * Get payments by customer
   */
  static async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Record daily payment
   */
  static async recordDailyPayment(data: {
    customer_id: string;
    amount: number;
    payment_type: string;
    payment_date: string;
    notes?: string;
    agent_id?: string;
    branch_id?: string;
  }): Promise<Payment> {
    // Use provided agent_id and branch_id, or get from auth
    let agentId = data.agent_id;
    let branchId = data.branch_id;

    if (!agentId || !branchId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userProfile } = await supabase
        .from('users')
        .select('id, branch_id')
        .eq('id', user.id)
        .single();

      if (!userProfile) throw new Error('User profile not found');
      
      agentId = userProfile.id;
      branchId = userProfile.branch_id;
    }

    // Get customer's loan (approved or active status)
    const { data: loan } = await supabase
      .from('loans')
      .select('id')
      .eq('customer_id', data.customer_id)
      .in('status', ['active', 'approved'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!loan) throw new Error('No active or approved loan found for this customer. Please ensure the loan is approved first.');

    const paymentData = {
      loan_id: loan.id,
      customer_id: data.customer_id,
      agent_id: agentId,
      branch_id: branchId,
      amount_due: data.amount,
      amount_paid: data.amount,
      payment_date: data.payment_date,
      notes: data.notes,
      status: 'paid' as const
    };

    const { data: payment, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;

    // Update daily payment schedule if exists
    await supabase
      .from('daily_payment_schedule')
      .update({
        status: 'completed',
        actual_amount: data.amount,
        payment_date: new Date().toISOString()
      })
      .eq('customer_id', data.customer_id)
      .eq('due_date', data.payment_date)
      .eq('status', 'pending');

    return payment;
  }

  /**
   * Mark payment as missed
   */
  static async markPaymentMissed(scheduleId: string): Promise<void> {
    const { error } = await supabase
      .from('daily_payment_schedule')
      .update({ status: 'missed' })
      .eq('id', scheduleId);

    if (error) throw error;
  }

  /**
   * Get payment summary for date range
   */
  static async getPaymentSummary(startDate: string, endDate: string, branchId?: string): Promise<any> {
    let query = supabase
      .from('payments')
      .select('amount_paid, status, payment_date')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const summary = {
      totalPayments: data?.length || 0,
      totalAmount: data?.reduce((sum, p) => sum + p.amount_paid, 0) || 0,
      paidCount: data?.filter(p => p.status === 'paid').length || 0,
      partialCount: data?.filter(p => p.status === 'partial').length || 0,
      unpaidCount: data?.filter(p => p.status === 'unpaid').length || 0,
      dailyBreakdown: this.groupByDate(data || [])
    };

    return summary;
  }

  /**
   * Helper to group payments by date
   */
  private static groupByDate(payments: any[]): Record<string, any> {
    return payments.reduce((acc, payment) => {
      const date = payment.payment_date;
      if (!acc[date]) {
        acc[date] = { count: 0, amount: 0 };
      }
      acc[date].count++;
      acc[date].amount += payment.amount_paid;
      return acc;
    }, {});
  }

  /**
   * Get loan payment summary with balance calculation
   */
  static async getLoanPaymentSummary(loanId: string): Promise<{
    loanAmount: number;
    totalPaid: number;
    balanceLeft: number;
    paymentsCount: number;
  }> {
    // Get loan details
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('amount, interest_rate, duration_weeks')
      .eq('id', loanId)
      .single();

    if (loanError) throw loanError;

    // Calculate total amount with interest
    const totalAmount = loan.amount * (1 + loan.interest_rate / 100);

    // Get all payments for this loan
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('loan_id', loanId);

    if (paymentsError) throw paymentsError;

    const totalPaid = payments?.reduce((sum, p) => sum + p.amount_paid, 0) || 0;
    const balanceLeft = totalAmount - totalPaid;

    return {
      loanAmount: totalAmount,
      totalPaid,
      balanceLeft: Math.max(0, balanceLeft),
      paymentsCount: payments?.length || 0,
    };
  }
}
