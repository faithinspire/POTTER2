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
}
