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

    // Get active loans for agent
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select(`
        id,
        customer_id,
        weekly_payment,
        customers(full_name)
      `)
      .eq('agent_id', agentId)
      .eq('status', 'approved')
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
          customer_name: loan.customers?.full_name || '',
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
}
