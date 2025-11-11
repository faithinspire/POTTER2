import { supabase } from './supabase';
import { format } from 'date-fns';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  entity_type?: string;
  entity_id?: string;
  read: boolean;
  created_at: string;
}

export class NotificationService {
  /**
   * Create a notification
   */
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    entityType?: string,
    entityId?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          entity_type: entityType,
          entity_id: entityId,
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Send real-time notification
      await this.sendRealTimeNotification(userId, data);

      return data;
    } catch (error) {
      console.error('Create notification error:', error);
      return null;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId: string, limit: number = 50, unreadOnly: boolean = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Get unread count error:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  /**
   * Send real-time notification via Supabase realtime
   */
  private static async sendRealTimeNotification(userId: string, notification: any) {
    // This would typically use Supabase's realtime features
    // For now, we'll use a simple approach
    try {
      const channel = supabase.channel(`notifications:${userId}`);
      channel.send({
        type: 'broadcast',
        event: 'new_notification',
        payload: notification
      });
    } catch (error) {
      console.error('Real-time notification error:', error);
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  static subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        callback(payload.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Notification templates for common scenarios
   */
  static async notifyLoanApproval(agentId: string, customerName: string, loanAmount: number, loanId: string) {
    return this.createNotification(
      agentId,
      'Loan Approved! 🎉',
      `Loan for ${customerName} (₦${loanAmount.toLocaleString()}) has been approved and is ready for disbursement.`,
      'success',
      'loan',
      loanId
    );
  }

  static async notifyLoanRejection(agentId: string, customerName: string, loanAmount: number, loanId: string, reason?: string) {
    return this.createNotification(
      agentId,
      'Loan Rejected',
      `Loan for ${customerName} (₦${loanAmount.toLocaleString()}) has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
      'warning',
      'loan',
      loanId
    );
  }

  static async notifyNewLoanApplication(subAdminId: string, customerName: string, loanAmount: number, agentName: string, loanId: string) {
    return this.createNotification(
      subAdminId,
      'New Loan Application',
      `${agentName} submitted a loan application for ${customerName} (₦${loanAmount.toLocaleString()}). Review required.`,
      'info',
      'loan',
      loanId
    );
  }

  static async notifyPaymentOverdue(agentId: string, customerName: string, weekNumber: number, amount: number, paymentId: string) {
    return this.createNotification(
      agentId,
      'Payment Overdue ⚠️',
      `${customerName}'s Week ${weekNumber} payment (₦${amount.toLocaleString()}) is overdue. Please follow up.`,
      'warning',
      'payment',
      paymentId
    );
  }

  static async notifyPaymentReceived(agentId: string, customerName: string, weekNumber: number, amount: number, paymentId: string) {
    return this.createNotification(
      agentId,
      'Payment Received ✅',
      `${customerName} made Week ${weekNumber} payment of ₦${amount.toLocaleString()}.`,
      'success',
      'payment',
      paymentId
    );
  }

  static async notifyCustomerRegistered(subAdminId: string, customerName: string, agentName: string, customerId: string) {
    return this.createNotification(
      subAdminId,
      'New Customer Registered',
      `${agentName} registered a new customer: ${customerName}.`,
      'info',
      'customer',
      customerId
    );
  }

  static async notifyWeeklyTarget(agentId: string, targetAmount: number, collectedAmount: number, percentage: number) {
    const type = percentage >= 100 ? 'success' : percentage >= 80 ? 'info' : 'warning';
    const emoji = percentage >= 100 ? '🎯' : percentage >= 80 ? '📈' : '⚠️';
    
    return this.createNotification(
      agentId,
      `Weekly Collection Update ${emoji}`,
      `You've collected ₦${collectedAmount.toLocaleString()} out of ₦${targetAmount.toLocaleString()} (${percentage.toFixed(1)}%) this week.`,
      type,
      'system',
      'weekly_target'
    );
  }

  static async notifySystemMaintenance(userId: string, maintenanceTime: string, duration: string) {
    return this.createNotification(
      userId,
      'Scheduled Maintenance',
      `System maintenance scheduled for ${maintenanceTime}. Expected duration: ${duration}. Please save your work.`,
      'info',
      'system',
      'maintenance'
    );
  }

  /**
   * Bulk notifications for branch or role
   */
  static async notifyBranch(branchId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    // Get all users in the branch
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .eq('branch_id', branchId);

    if (error || !users) return;

    // Create notifications for all users
    const notifications = users.map(user => ({
      user_id: user.id,
      title,
      message,
      type,
      read: false
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Bulk notification error:', insertError);
    }
  }

  static async notifyRole(role: 'agent' | 'subadmin' | 'admin', title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', branchId?: string) {
    // Get all users with the specified role
    let query = supabase
      .from('users')
      .select('id')
      .eq('role', role);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data: users, error } = await query;
    if (error || !users) return;

    // Create notifications for all users
    const notifications = users.map(user => ({
      user_id: user.id,
      title,
      message,
      type,
      read: false
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Role notification error:', insertError);
    }
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  static async cleanupOldNotifications() {
    const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', thirtyDaysAgo)
      .eq('read', true);

    if (error) {
      console.error('Cleanup notifications error:', error);
    }
  }
}