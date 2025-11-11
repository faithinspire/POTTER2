import { supabase } from './supabase';
import { format } from 'date-fns';

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  branch_id?: string;
  created_at: string;
}

export class AuditService {
  /**
   * Log user action
   */
  static async logAction(
    action: string,
    entityType: string,
    entityId: string,
    oldValues?: any,
    newValues?: any
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user details
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, branch_id')
        .eq('id', user.id)
        .single();

      const auditLog = {
        user_id: user.id,
        user_name: userData?.full_name || user.email || 'Unknown',
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        branch_id: userData?.branch_id || null
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert(auditLog);

      if (error) {
        console.error('Audit log error:', error);
      }
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  /**
   * Get audit logs with filters
   */
  static async getAuditLogs(filters: {
    branchId?: string;
    userId?: string;
    entityType?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  }

  /**
   * Get audit summary statistics
   */
  static async getAuditSummary(branchId?: string, days: number = 30) {
    const startDate = format(new Date(Date.now() - days * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    let query = supabase
      .from('audit_logs')
      .select('action, entity_type, created_at')
      .gte('created_at', startDate);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const summary = {
      totalActions: data?.length || 0,
      actionsByType: {} as Record<string, number>,
      actionsByEntity: {} as Record<string, number>,
      dailyActivity: {} as Record<string, number>
    };

    data?.forEach(log => {
      // Count by action type
      summary.actionsByType[log.action] = (summary.actionsByType[log.action] || 0) + 1;
      
      // Count by entity type
      summary.actionsByEntity[log.entity_type] = (summary.actionsByEntity[log.entity_type] || 0) + 1;
      
      // Count by day
      const day = format(new Date(log.created_at), 'yyyy-MM-dd');
      summary.dailyActivity[day] = (summary.dailyActivity[day] || 0) + 1;
    });

    return summary;
  }

  /**
   * Get user activity summary
   */
  static async getUserActivity(userId: string, days: number = 30) {
    const startDate = format(new Date(Date.now() - days * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const activity = {
      totalActions: data?.length || 0,
      recentActions: data?.slice(0, 10) || [],
      actionsByType: {} as Record<string, number>,
      actionsByEntity: {} as Record<string, number>
    };

    data?.forEach(log => {
      activity.actionsByType[log.action] = (activity.actionsByType[log.action] || 0) + 1;
      activity.actionsByEntity[log.entity_type] = (activity.actionsByEntity[log.entity_type] || 0) + 1;
    });

    return activity;
  }

  /**
   * Get entity change history
   */
  static async getEntityHistory(entityType: string, entityId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(log => ({
      ...log,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null
    }));
  }

  /**
   * Get client IP address (best effort)
   */
  private static async getClientIP(): Promise<string | null> {
    try {
      // This is a simple approach - in production you might want to use a service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }

  /**
   * Predefined action types for consistency
   */
  static readonly ACTIONS = {
    // Customer actions
    CUSTOMER_CREATED: 'customer_created',
    CUSTOMER_UPDATED: 'customer_updated',
    CUSTOMER_DELETED: 'customer_deleted',
    CUSTOMER_VIEWED: 'customer_viewed',
    
    // Loan actions
    LOAN_APPLIED: 'loan_applied',
    LOAN_APPROVED: 'loan_approved',
    LOAN_REJECTED: 'loan_rejected',
    LOAN_UPDATED: 'loan_updated',
    LOAN_VIEWED: 'loan_viewed',
    
    // Payment actions
    PAYMENT_RECORDED: 'payment_recorded',
    PAYMENT_UPDATED: 'payment_updated',
    PAYMENT_VIEWED: 'payment_viewed',
    
    // User actions
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    USER_VIEWED: 'user_viewed',
    
    // System actions
    DATA_EXPORTED: 'data_exported',
    REPORT_GENERATED: 'report_generated',
    SEARCH_PERFORMED: 'search_performed'
  };

  /**
   * Entity types for consistency
   */
  static readonly ENTITIES = {
    CUSTOMER: 'customer',
    LOAN: 'loan',
    PAYMENT: 'payment',
    USER: 'user',
    BRANCH: 'branch',
    SYSTEM: 'system'
  };
}

// Helper function to easily log actions throughout the app
export const logAction = AuditService.logAction.bind(AuditService);