import { supabase } from './supabase';
import { format } from 'date-fns';

export class ExportService {
  /**
   * Export customers to CSV
   */
  static async exportCustomers(branchId?: string) {
    let query = supabase
      .from('customers')
      .select(`
        *,
        guarantors(*),
        agent:users!customers_agent_id_fkey(full_name),
        branch:branches(name)
      `);
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const csvHeaders = [
      'Customer ID',
      'Full Name',
      'Phone',
      'Email',
      'Address',
      'Occupation',
      'Monthly Income',
      'Agent',
      'Branch',
      'Registration Date',
      'Guarantor 1 Name',
      'Guarantor 1 Phone',
      'Guarantor 2 Name',
      'Guarantor 2 Phone',
      'Guarantor 3 Name',
      'Guarantor 3 Phone'
    ];

    const csvRows = data?.map(customer => {
      const guarantors = customer.guarantors || [];
      return [
        customer.id,
        customer.full_name,
        customer.phone,
        customer.email || '',
        customer.address,
        customer.occupation,
        customer.monthly_income,
        customer.agent?.full_name || '',
        customer.branch?.name || '',
        format(new Date(customer.created_at), 'yyyy-MM-dd'),
        guarantors[0]?.full_name || '',
        guarantors[0]?.phone || '',
        guarantors[1]?.full_name || '',
        guarantors[1]?.phone || '',
        guarantors[2]?.full_name || '',
        guarantors[2]?.phone || ''
      ];
    }) || [];

    return this.generateCSV(csvHeaders, csvRows, 'customers');
  }

  /**
   * Export loans to CSV
   */
  static async exportLoans(branchId?: string) {
    let query = supabase
      .from('loans')
      .select(`
        *,
        customer:customers(full_name, phone),
        agent:users!loans_agent_id_fkey(full_name),
        branch:branches(name)
      `);
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const csvHeaders = [
      'Loan ID',
      'Customer Name',
      'Customer Phone',
      'Amount',
      'Weekly Payment',
      'Duration (weeks)',
      'Status',
      'Application Date',
      'Approval Date',
      'Agent',
      'Branch',
      'Purpose'
    ];

    const csvRows = data?.map(loan => [
      loan.id,
      loan.customer?.full_name || '',
      loan.customer?.phone || '',
      loan.amount,
      loan.weekly_payment,
      loan.duration_weeks,
      loan.status,
      format(new Date(loan.application_date), 'yyyy-MM-dd'),
      loan.approval_date ? format(new Date(loan.approval_date), 'yyyy-MM-dd') : '',
      loan.agent?.full_name || '',
      loan.branch?.name || '',
      loan.purpose || ''
    ]) || [];

    return this.generateCSV(csvHeaders, csvRows, 'loans');
  }

  /**
   * Export payments to CSV
   */
  static async exportPayments(branchId?: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        customer:customers(full_name, phone),
        loan:loans(amount),
        agent:users!payments_agent_id_fkey(full_name),
        branch:branches(name)
      `);
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    
    if (startDate) {
      query = query.gte('payment_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('payment_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const csvHeaders = [
      'Payment ID',
      'Customer Name',
      'Customer Phone',
      'Loan Amount',
      'Payment Date',
      'Week Number',
      'Amount Due',
      'Amount Paid',
      'Status',
      'Agent',
      'Branch',
      'Collection Date'
    ];

    const csvRows = data?.map(payment => [
      payment.id,
      payment.customer?.full_name || '',
      payment.customer?.phone || '',
      payment.loan?.amount || '',
      payment.payment_date,
      payment.week_number,
      payment.amount_due,
      payment.amount_paid,
      payment.status,
      payment.agent?.full_name || '',
      payment.branch?.name || '',
      payment.collected_at ? format(new Date(payment.collected_at), 'yyyy-MM-dd HH:mm') : ''
    ]) || [];

    return this.generateCSV(csvHeaders, csvRows, 'payments');
  }

  /**
   * Export analytics report to CSV
   */
  static async exportAnalyticsReport(branchId?: string) {
    // This would use the AnalyticsService to get comprehensive data
    const { AnalyticsService } = await import('./analyticsService');
    
    const [analytics, loanTrends, paymentTrends, agentPerformance] = await Promise.all([
      AnalyticsService.getBranchAnalytics(branchId),
      AnalyticsService.getLoanTrends(branchId, 30),
      AnalyticsService.getPaymentTrends(branchId, 30),
      AnalyticsService.getAgentPerformance(branchId)
    ]);

    // Summary section
    const summaryHeaders = ['Metric', 'Value'];
    const summaryRows = [
      ['Total Customers', analytics?.totalCustomers || 0],
      ['Total Loans', analytics?.totalLoans || 0],
      ['Active Loans', analytics?.activeLoans || 0],
      ['Pending Loans', analytics?.pendingLoans || 0],
      ['Approved Loans', analytics?.approvedLoans || 0],
      ['Total Disbursed', analytics?.totalDisbursed || 0],
      ['Total Collected', analytics?.totalCollected || 0],
      ['Collection Rate (%)', analytics?.collectionRate || 0]
    ];

    // Agent performance section
    const agentHeaders = ['Agent Name', 'Customers', 'Loans', 'Approved', 'Disbursed', 'Collected', 'Conversion Rate (%)'];
    const agentRows = agentPerformance?.map(agent => [
      agent.full_name,
      agent.totalCustomers,
      agent.totalLoans,
      agent.approvedLoans,
      agent.totalDisbursed,
      agent.totalCollected,
      Math.round(agent.conversionRate * 100) / 100
    ]) || [];

    // Combine all data
    const allRows = [
      ['BRANCH ANALYTICS REPORT'],
      ['Generated on:', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
      [''],
      ['SUMMARY'],
      ...summaryHeaders,
      ...summaryRows,
      [''],
      ['AGENT PERFORMANCE'],
      agentHeaders,
      ...agentRows
    ];

    return this.generateCSV([], allRows, 'analytics-report');
  }

  /**
   * Generate CSV file and trigger download
   */
  private static generateCSV(headers: string[], rows: any[][], filename: string) {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, filename: `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv` };
  }

  /**
   * Generate PDF report (basic implementation)
   */
  static async generatePDFReport(type: 'customers' | 'loans' | 'payments' | 'analytics', branchId?: string) {
    // This is a placeholder for PDF generation
    // In a real implementation, you'd use a library like jsPDF or Puppeteer
    
    const reportData = {
      title: `${type.toUpperCase()} REPORT`,
      generatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      branchId: branchId || 'All Branches'
    };

    // For now, we'll create a simple HTML report that can be printed as PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MILLENNIUM POTTER</h1>
            <h2>${reportData.title}</h2>
          </div>
          <div class="info">
            <p><strong>Generated:</strong> ${reportData.generatedAt}</p>
            <p><strong>Branch:</strong> ${reportData.branchId}</p>
          </div>
          <p>This is a basic PDF report. For full functionality, integrate with a PDF generation library.</p>
        </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    return { success: true, message: 'PDF report opened in new window for printing' };
  }
}