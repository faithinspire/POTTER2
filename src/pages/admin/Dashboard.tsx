import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { AnalyticsService } from '../../services/analyticsService';
import { LoanService } from '../../services/loanService';
import { DashboardStats } from '../../types/disbursement';
import { LoanWithDetails } from '../../types/loan';
import { formatCurrency } from '../../utils/formatters';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [disbursedAmounts, setDisbursedAmounts] = useState({ weekly: 0, monthly: 0, yearly: 0 });
  const [recentLoans, setRecentLoans] = useState<LoanWithDetails[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, disbursed, loans] = await Promise.all([
        AnalyticsService.getDashboardStats(),
        AnalyticsService.getTotalDisbursedByPeriod(),
        LoanService.getAllLoans(),
      ]);

      setStats(statsData);
      setDisbursedAmounts(disbursed);
      setRecentLoans(loans.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportType: 'loans' | 'payments' | 'customers' | 'disbursements') => {
    setDownloading(true);
    try {
      const data = await AnalyticsService.generateReport(reportType);
      
      // Convert to CSV
      if (data.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).map(v => 
        typeof v === 'object' ? JSON.stringify(v) : v
      ).join(','));
      const csv = [headers, ...rows].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative" style={{ backgroundColor: '#0F172A' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="glass-navbar p-4">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Millennium Potter
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <span className="text-white text-sm sm:text-base">Welcome, {profile?.full_name}</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs sm:text-sm font-semibold">
                Admin
              </span>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h2>
            <Button 
              variant="gold" 
              size="sm"
              onClick={() => loadDashboardData()}
            >
              🔄 Refresh
            </Button>
          </div>
          
          {/* Real-time Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Users</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stats?.total_users || 0}</p>
                </div>
                <div className="text-3xl sm:text-4xl">👥</div>
              </div>
            </Card>

            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Customers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stats?.total_customers || 0}</p>
                </div>
                <div className="text-3xl sm:text-4xl">👤</div>
              </div>
            </Card>

            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Active Loans</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stats?.active_loans || 0}</p>
                </div>
                <div className="text-3xl sm:text-4xl">💰</div>
              </div>
            </Card>

            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Collection Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stats?.collection_rate.toFixed(1) || 0}%</p>
                </div>
                <div className="text-3xl sm:text-4xl">📊</div>
              </div>
            </Card>
          </div>

          {/* Disbursed Amounts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card className="glass-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Weekly Disbursed</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-400">{formatCurrency(disbursedAmounts.weekly)}</p>
            </Card>

            <Card className="glass-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Monthly Disbursed</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">{formatCurrency(disbursedAmounts.monthly)}</p>
            </Card>

            <Card className="glass-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Yearly Disbursed</h3>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">{formatCurrency(disbursedAmounts.yearly)}</p>
            </Card>
          </div>

          {/* Download Reports */}
          <Card className="glass-card p-4 sm:p-6 mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Download Reports</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => downloadReport('loans')}
                disabled={downloading}
                fullWidth
              >
                📄 Loans
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => downloadReport('payments')}
                disabled={downloading}
                fullWidth
              >
                💳 Payments
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => downloadReport('customers')}
                disabled={downloading}
                fullWidth
              >
                👥 Customers
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => downloadReport('disbursements')}
                disabled={downloading}
                fullWidth
              >
                💰 Disbursements
              </Button>
            </div>
          </Card>

          {/* Recent Loans */}
          <Card className="glass-card p-4 sm:p-6 mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Recent Loans</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 pb-3 px-2">Customer</th>
                    <th className="text-left text-gray-400 pb-3 px-2">Amount</th>
                    <th className="text-left text-gray-400 pb-3 px-2">Status</th>
                    <th className="text-left text-gray-400 pb-3 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLoans.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-400 py-8">
                        No loans yet
                      </td>
                    </tr>
                  ) : (
                    recentLoans.map((loan) => (
                      <tr key={loan.id} className="border-b border-gray-700/50">
                        <td className="py-3 px-2 text-white">{loan.customer_name}</td>
                        <td className="py-3 px-2 text-white">{formatCurrency(loan.amount)}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            loan.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            loan.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            loan.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-400">
                          {new Date(loan.application_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Button
              variant="gold"
              fullWidth
              onClick={() => navigate('/admin/users')}
            >
              👥 Manage Users
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/admin/analytics')}
            >
              📊 View Analytics
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => window.location.reload()}
            >
              🔄 Refresh Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
