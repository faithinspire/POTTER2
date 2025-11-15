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
import { supabase } from '../../services/supabase';


interface BranchStats {
  id: string;
  name: string;
  total_customers: number;
  active_loans: number;
  total_disbursed: number;
  total_payments: number;
  agents_count: number;
  subadmins_count: number;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [disbursedAmounts, setDisbursedAmounts] = useState({ weekly: 0, monthly: 0, yearly: 0 });
  const [recentLoans, setRecentLoans] = useState<LoanWithDetails[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('🔄 Loading dashboard data...');
      
      // Load each section independently with timeouts
      async function loadWithTimeout<T>(promise: Promise<T>, fallback: T, name: string): Promise<T> {
        try {
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          );
          
          const result = await Promise.race([promise, timeoutPromise]);
          console.log(`✅ ${name} loaded successfully`);
          return result;
        } catch (error) {
          console.error(`❌ ${name} failed:`, error);
          return fallback;
        }
      }

      // Load all data with fallbacks
      const [statsData, disbursed, loans, branches] = await Promise.all([
        loadWithTimeout(
          AnalyticsService.getDashboardStats(),
          { total_users: 0, total_customers: 0, active_loans: 0, collection_rate: 0 },
          'Stats'
        ),
        loadWithTimeout(
          AnalyticsService.getTotalDisbursedByPeriod(),
          { weekly: 0, monthly: 0, yearly: 0 },
          'Disbursed amounts'
        ),
        loadWithTimeout(
          LoanService.getAllLoans(),
          [],
          'Recent loans'
        ),
        loadWithTimeout(
          loadBranchStats(),
          [],
          'Branch stats'
        ),
      ]);

      console.log('✅ All dashboard data processed:', { 
        stats: !!statsData, 
        disbursed: !!disbursed, 
        loans: loans.length, 
        branches: branches.length 
      });

      setStats(statsData);
      setDisbursedAmounts(disbursed);
      setRecentLoans(loans.slice(0, 10));
      setBranchStats(branches);

    } catch (error) {
      console.error('❌ Critical error loading dashboard:', error);
      // Ensure we always have some data to show
      setStats({ total_users: 0, total_customers: 0, active_loans: 0, collection_rate: 0 });
      setDisbursedAmounts({ weekly: 0, monthly: 0, yearly: 0 });
      setRecentLoans([]);
      setBranchStats([]);
    } finally {
      setLoading(false);
      console.log('🔄 Dashboard loading complete');
    }
  };

  const loadBranchStats = async (): Promise<BranchStats[]> => {
    try {
      console.log('🔄 Loading branch stats...');
      
      // Simple query first - just get branches
      const { data: branches, error: branchError } = await supabase
        .from('branches')
        .select('id, name');

      if (branchError) {
        console.error('Branch query failed:', branchError);
        return [];
      }

      if (!branches || branches.length === 0) {
        console.log('No branches found');
        return [];
      }

      console.log('✅ Found branches:', branches.length);

      // Try to get additional stats, but don't fail if it doesn't work
      const branchStatsPromises = branches.map(async (branch) => {
        try {
          // Get basic counts with simple queries
          const [customersResult, loansResult, usersResult] = await Promise.allSettled([
            supabase.from('customers').select('id', { count: 'exact' }).eq('branch_id', branch.id),
            supabase.from('loans').select('id, amount, status', { count: 'exact' }).eq('branch_id', branch.id),
            supabase.from('users').select('id, role', { count: 'exact' }).eq('branch_id', branch.id)
          ]);

          const customers = customersResult.status === 'fulfilled' ? (customersResult.value.count || 0) : 0;
          const loans = loansResult.status === 'fulfilled' ? (loansResult.value.data || []) : [];
          const users = usersResult.status === 'fulfilled' ? (usersResult.value.data || []) : [];

          return {
            id: branch.id,
            name: branch.name,
            total_customers: customers,
            active_loans: loans.filter((l: any) => l.status === 'active').length,
            total_disbursed: loans.reduce((sum: number, l: any) => sum + (l.amount || 0), 0),
            total_payments: 0, // Will be calculated separately if needed
            agents_count: users.filter((u: any) => u.role === 'agent').length,
            subadmins_count: users.filter((u: any) => u.role === 'subadmin').length,
          };
        } catch (error) {
          console.error(`Error loading stats for branch ${branch.name}:`, error);
          // Return basic branch info even if stats fail
          return {
            id: branch.id,
            name: branch.name,
            total_customers: 0,
            active_loans: 0,
            total_disbursed: 0,
            total_payments: 0,
            agents_count: 0,
            subadmins_count: 0,
          };
        }
      });

      const results = await Promise.allSettled(branchStatsPromises);
      const branchStats = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<BranchStats>).value);

      console.log('✅ Branch stats loaded:', branchStats.length);
      return branchStats;

    } catch (error) {
      console.error('❌ Error loading branch stats:', error);
      // Return empty array instead of crashing
      return [];
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
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Add error state display
  const hasError = !stats;
  if (hasError) {
    console.log('⚠️ Dashboard in error state, showing fallback');
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

          {/* Branch Oversight */}
          <Card className="glass-card p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                🏢 Branch Oversight
                {branchStats.length > 0 && (
                  <span className="text-sm text-gray-400 ml-2">({branchStats.length} branches)</span>
                )}
              </h3>
              {branchStats.length > 0 && (
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500"
                >
                  <option value="all">All Branches</option>
                  {branchStats.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              )}
            </div>
            
            {branchStats.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏢</div>
                <h4 className="text-lg font-semibold text-white mb-2">Branch Data Loading</h4>
                <p className="text-gray-400 mb-4">
                  Branch oversight data is being loaded. This may take a moment on first load.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-200 text-sm">
                  <p><strong>Branch Oversight Features:</strong></p>
                  <ul className="text-left mt-2 space-y-1">
                    <li>• Track staff performance across branches</li>
                    <li>• Monitor customer acquisition by branch</li>
                    <li>• View loan disbursements and collections</li>
                    <li>• Compare branch performance metrics</li>
                  </ul>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => loadDashboardData()}
                  className="mt-4"
                >
                  🔄 Retry Loading Branch Data
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 pb-3 px-2">Branch</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Staff</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Customers</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Active Loans</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Disbursed</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchStats
                      .filter(branch => selectedBranch === 'all' || branch.id === selectedBranch)
                      .map((branch) => (
                        <tr key={branch.id} className="border-b border-gray-700/50 hover:bg-white/5">
                          <td className="py-3 px-2 text-white font-semibold">{branch.name}</td>
                          <td className="py-3 px-2 text-gray-300">
                            <div className="text-xs">
                              <div>👥 {branch.agents_count} Agents</div>
                              <div>🔧 {branch.subadmins_count} Sub-Admins</div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-white">{branch.total_customers}</td>
                          <td className="py-3 px-2 text-white">{branch.active_loans}</td>
                          <td className="py-3 px-2 text-green-400 font-semibold">
                            {formatCurrency(branch.total_disbursed)}
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

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
