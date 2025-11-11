import { supabase } from './supabase';

export class SearchService {
  /**
   * Global search across all entities
   */
  static async globalSearch(query: string, branchId?: string) {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const [customers, loans, users, payments] = await Promise.all([
      this.searchCustomers(query, branchId),
      this.searchLoans(query, branchId),
      this.searchUsers(query, branchId),
      this.searchPayments(query, branchId)
    ]);

    return {
      customers: customers || [],
      loans: loans || [],
      users: users || [],
      payments: payments || [],
      totalResults: (customers?.length || 0) + (loans?.length || 0) + (users?.length || 0) + (payments?.length || 0)
    };
  }

  /**
   * Search customers
   */
  static async searchCustomers(query: string, branchId?: string) {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    let searchQuery = supabase
      .from('customers')
      .select(`
        *,
        agent:users!customers_agent_id_fkey(full_name),
        branch:branches(name),
        guarantors(*)
      `)
      .or(`full_name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm},address.ilike.${searchTerm},occupation.ilike.${searchTerm}`);
    
    if (branchId) {
      searchQuery = searchQuery.eq('branch_id', branchId);
    }

    const { data, error } = await searchQuery.limit(50);
    if (error) {
      console.error('Customer search error:', error);
      return [];
    }

    return data?.map(customer => ({
      ...customer,
      type: 'customer',
      searchRelevance: this.calculateRelevance(query, [
        customer.full_name,
        customer.phone,
        customer.email,
        customer.address,
        customer.occupation
      ])
    }));
  }

  /**
   * Search loans
   */
  static async searchLoans(query: string, branchId?: string) {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    let searchQuery = supabase
      .from('loans')
      .select(`
        *,
        customer:customers(full_name, phone),
        agent:users!loans_agent_id_fkey(full_name),
        branch:branches(name)
      `)
      .or(`purpose.ilike.${searchTerm},status.ilike.${searchTerm}`);
    
    if (branchId) {
      searchQuery = searchQuery.eq('branch_id', branchId);
    }

    const { data, error } = await searchQuery.limit(50);
    if (error) {
      console.error('Loan search error:', error);
      return [];
    }

    // Also search by customer name
    const customerSearchQuery = supabase
      .from('loans')
      .select(`
        *,
        customer:customers!inner(full_name, phone),
        agent:users!loans_agent_id_fkey(full_name),
        branch:branches(name)
      `)
      .ilike('customer.full_name', searchTerm);
    
    if (branchId) {
      customerSearchQuery.eq('branch_id', branchId);
    }

    const { data: customerLoans } = await customerSearchQuery.limit(50);

    // Combine and deduplicate results
    const allLoans = [...(data || []), ...(customerLoans || [])];
    const uniqueLoans = allLoans.filter((loan, index, self) => 
      index === self.findIndex(l => l.id === loan.id)
    );

    return uniqueLoans.map(loan => ({
      ...loan,
      type: 'loan',
      searchRelevance: this.calculateRelevance(query, [
        loan.purpose,
        loan.status,
        loan.customer?.full_name,
        loan.amount?.toString()
      ])
    }));
  }

  /**
   * Search users (agents, sub-admins)
   */
  static async searchUsers(query: string, branchId?: string) {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    let searchQuery = supabase
      .from('users')
      .select(`
        *,
        branch:branches(name)
      `)
      .or(`full_name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .neq('role', 'admin'); // Exclude admin from search results
    
    if (branchId) {
      searchQuery = searchQuery.eq('branch_id', branchId);
    }

    const { data, error } = await searchQuery.limit(50);
    if (error) {
      console.error('User search error:', error);
      return [];
    }

    return data?.map(user => ({
      ...user,
      type: 'user',
      searchRelevance: this.calculateRelevance(query, [
        user.full_name,
        user.phone,
        user.email,
        user.role
      ])
    }));
  }

  /**
   * Search payments
   */
  static async searchPayments(query: string, branchId?: string) {
    // For payments, we mainly search by customer name or payment status
    const searchTerm = `%${query.toLowerCase()}%`;
    
    let searchQuery = supabase
      .from('payments')
      .select(`
        *,
        customer:customers!inner(full_name, phone),
        loan:loans(amount),
        agent:users!payments_agent_id_fkey(full_name),
        branch:branches(name)
      `)
      .or(`status.ilike.${searchTerm}`)
      .ilike('customer.full_name', searchTerm);
    
    if (branchId) {
      searchQuery = searchQuery.eq('branch_id', branchId);
    }

    const { data, error } = await searchQuery.limit(50);
    if (error) {
      console.error('Payment search error:', error);
      return [];
    }

    return data?.map(payment => ({
      ...payment,
      type: 'payment',
      searchRelevance: this.calculateRelevance(query, [
        payment.customer?.full_name,
        payment.status,
        payment.payment_date
      ])
    }));
  }

  /**
   * Advanced search with filters
   */
  static async advancedSearch(filters: {
    query?: string;
    type?: 'customers' | 'loans' | 'users' | 'payments';
    branchId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    amountMin?: number;
    amountMax?: number;
  }) {
    const { query, type, branchId, dateFrom, dateTo, status, amountMin, amountMax } = filters;

    switch (type) {
      case 'customers':
        return this.advancedCustomerSearch({ query, branchId, dateFrom, dateTo });
      case 'loans':
        return this.advancedLoanSearch({ query, branchId, dateFrom, dateTo, status, amountMin, amountMax });
      case 'users':
        return this.advancedUserSearch({ query, branchId });
      case 'payments':
        return this.advancedPaymentSearch({ query, branchId, dateFrom, dateTo, status });
      default:
        return this.globalSearch(query || '', branchId);
    }
  }

  /**
   * Advanced customer search
   */
  private static async advancedCustomerSearch(filters: {
    query?: string;
    branchId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    let searchQuery = supabase
      .from('customers')
      .select(`
        *,
        agent:users!customers_agent_id_fkey(full_name),
        branch:branches(name),
        guarantors(*)
      `);

    if (filters.query) {
      const searchTerm = `%${filters.query.toLowerCase()}%`;
      searchQuery = searchQuery.or(`full_name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`);
    }

    if (filters.branchId) {
      searchQuery = searchQuery.eq('branch_id', filters.branchId);
    }

    if (filters.dateFrom) {
      searchQuery = searchQuery.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      searchQuery = searchQuery.lte('created_at', filters.dateTo);
    }

    const { data, error } = await searchQuery.limit(100);
    if (error) throw error;

    return data;
  }

  /**
   * Advanced loan search
   */
  private static async advancedLoanSearch(filters: {
    query?: string;
    branchId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    amountMin?: number;
    amountMax?: number;
  }) {
    let searchQuery = supabase
      .from('loans')
      .select(`
        *,
        customer:customers(full_name, phone),
        agent:users!loans_agent_id_fkey(full_name),
        branch:branches(name)
      `);

    if (filters.query) {
      const searchTerm = `%${filters.query.toLowerCase()}%`;
      searchQuery = searchQuery.or(`purpose.ilike.${searchTerm}`);
    }

    if (filters.branchId) {
      searchQuery = searchQuery.eq('branch_id', filters.branchId);
    }

    if (filters.status) {
      searchQuery = searchQuery.eq('status', filters.status);
    }

    if (filters.amountMin) {
      searchQuery = searchQuery.gte('amount', filters.amountMin);
    }

    if (filters.amountMax) {
      searchQuery = searchQuery.lte('amount', filters.amountMax);
    }

    if (filters.dateFrom) {
      searchQuery = searchQuery.gte('application_date', filters.dateFrom);
    }

    if (filters.dateTo) {
      searchQuery = searchQuery.lte('application_date', filters.dateTo);
    }

    const { data, error } = await searchQuery.limit(100);
    if (error) throw error;

    return data;
  }

  /**
   * Advanced user search
   */
  private static async advancedUserSearch(filters: {
    query?: string;
    branchId?: string;
  }) {
    let searchQuery = supabase
      .from('users')
      .select(`
        *,
        branch:branches(name)
      `)
      .neq('role', 'admin');

    if (filters.query) {
      const searchTerm = `%${filters.query.toLowerCase()}%`;
      searchQuery = searchQuery.or(`full_name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`);
    }

    if (filters.branchId) {
      searchQuery = searchQuery.eq('branch_id', filters.branchId);
    }

    const { data, error } = await searchQuery.limit(100);
    if (error) throw error;

    return data;
  }

  /**
   * Advanced payment search
   */
  private static async advancedPaymentSearch(filters: {
    query?: string;
    branchId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }) {
    let searchQuery = supabase
      .from('payments')
      .select(`
        *,
        customer:customers(full_name, phone),
        loan:loans(amount),
        agent:users!payments_agent_id_fkey(full_name),
        branch:branches(name)
      `);

    if (filters.query) {
      const searchTerm = `%${filters.query.toLowerCase()}%`;
      searchQuery = searchQuery.ilike('customer.full_name', searchTerm);
    }

    if (filters.branchId) {
      searchQuery = searchQuery.eq('branch_id', filters.branchId);
    }

    if (filters.status) {
      searchQuery = searchQuery.eq('status', filters.status);
    }

    if (filters.dateFrom) {
      searchQuery = searchQuery.gte('payment_date', filters.dateFrom);
    }

    if (filters.dateTo) {
      searchQuery = searchQuery.lte('payment_date', filters.dateTo);
    }

    const { data, error } = await searchQuery.limit(100);
    if (error) throw error;

    return data;
  }

  /**
   * Calculate search relevance score
   */
  private static calculateRelevance(query: string, fields: (string | null | undefined)[]): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    fields.forEach(field => {
      if (field) {
        const fieldLower = field.toLowerCase();
        if (fieldLower === queryLower) {
          score += 10; // Exact match
        } else if (fieldLower.startsWith(queryLower)) {
          score += 5; // Starts with query
        } else if (fieldLower.includes(queryLower)) {
          score += 2; // Contains query
        }
      }
    });

    return score;
  }

  /**
   * Get search suggestions
   */
  static async getSearchSuggestions(query: string, branchId?: string): Promise<string[]> {
    if (query.length < 2) return [];

    const searchTerm = `%${query.toLowerCase()}%`;
    const suggestions: Set<string> = new Set();

    // Get customer names
    let customerQuery = supabase
      .from('customers')
      .select('full_name')
      .ilike('full_name', searchTerm)
      .limit(5);
    
    if (branchId) {
      customerQuery = customerQuery.eq('branch_id', branchId);
    }

    const { data: customers } = await customerQuery;
    customers?.forEach(c => suggestions.add(c.full_name));

    // Get user names
    let userQuery = supabase
      .from('users')
      .select('full_name')
      .ilike('full_name', searchTerm)
      .neq('role', 'admin')
      .limit(5);
    
    if (branchId) {
      userQuery = userQuery.eq('branch_id', branchId);
    }

    const { data: users } = await userQuery;
    users?.forEach(u => suggestions.add(u.full_name));

    return Array.from(suggestions).slice(0, 8);
  }
}