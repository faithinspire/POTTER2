import { supabase } from './supabase';
import { Customer, Guarantor, CustomerWithGuarantors } from '../types/customer';

export class CustomerService {
  /**
   * Create a new customer with guarantors
   */
  static async createCustomer(
    customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>,
    guarantors: Omit<Guarantor, 'id' | 'customer_id' | 'created_at'>[]
  ): Promise<Customer> {
    // Insert customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (customerError) throw customerError;

    // Insert guarantors
    if (guarantors.length > 0) {
      const guarantorsWithCustomerId = guarantors.map(g => ({
        ...g,
        customer_id: customer.id,
      }));

      const { error: guarantorError } = await supabase
        .from('guarantors')
        .insert(guarantorsWithCustomerId);

      if (guarantorError) throw guarantorError;
    }

    return customer;
  }

  /**
   * Get customers for an agent
   */
  static async getCustomersByAgent(agentId: string): Promise<CustomerWithGuarantors[]> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        guarantors(*)
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get customers by branch
   */
  static async getCustomersByBranch(branchId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        guarantors(*),
        agent:users!customers_agent_id_fkey(full_name)
      `)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(customer => ({
      ...customer,
      agent_name: customer.agent?.full_name || 'Unknown'
    }));
  }

  /**
   * Get all customers (admin only)
   */
  static async getAllCustomers(): Promise<CustomerWithGuarantors[]> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        guarantors(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Search customers
   */
  static async searchCustomers(query: string, agentId?: string): Promise<Customer[]> {
    let queryBuilder = supabase
      .from('customers')
      .select('*')
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,id_number.ilike.%${query}%`);

    if (agentId) {
      queryBuilder = queryBuilder.eq('agent_id', agentId);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get customer by ID with guarantors
   */
  static async getCustomerById(customerId: string): Promise<CustomerWithGuarantors | null> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        guarantors(*)
      `)
      .eq('id', customerId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get customer details with guarantors and loans
   */
  static async getCustomerDetails(customerId: string): Promise<any> {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select(`
        *,
        guarantors(*),
        loans(*)
      `)
      .eq('id', customerId)
      .single();

    if (customerError) throw customerError;
    return customer;
  }

  /**
   * Update customer photo
   */
  static async updateCustomerPhoto(customerId: string, photoUrl: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update({ photo_url: photoUrl })
      .eq('id', customerId);

    if (error) throw error;
  }

  /**
   * Upload customer photo to Supabase Storage
   */
  static async uploadCustomerPhoto(customerId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${customerId}-${Date.now()}.${fileExt}`;
    const filePath = `customer-photos/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('customer-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('customer-photos')
      .getPublicUrl(filePath);

    // Update customer record with photo URL
    await this.updateCustomerPhoto(customerId, data.publicUrl);

    return data.publicUrl;
  }

  /**
   * Update customer with enhanced fields
   */
  static async updateCustomer(
    customerId: string,
    updates: Partial<Customer>
  ): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats(customerId: string): Promise<any> {
    const [loansResult, paymentsResult] = await Promise.all([
      supabase
        .from('loans')
        .select('principal_amount, interest_amount, status')
        .eq('customer_id', customerId),
      supabase
        .from('payments')
        .select('amount, payment_type, created_at')
        .eq('customer_id', customerId)
    ]);

    const loans = loansResult.data || [];
    const payments = paymentsResult.data || [];

    const totalBorrowed = loans.reduce((sum, loan) => sum + loan.principal_amount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const activeLoans = loans.filter(loan => loan.status === 'active').length;
    const completedLoans = loans.filter(loan => loan.status === 'completed').length;

    return {
      totalBorrowed,
      totalPaid,
      activeLoans,
      completedLoans,
      totalLoans: loans.length,
      totalPayments: payments.length,
      paymentHistory: payments.slice(0, 10)
    };
  }
}
