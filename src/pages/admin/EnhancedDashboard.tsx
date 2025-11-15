import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { CustomerDetailModal } from '../../components/modals/CustomerDetailModal';
import { DailyPaymentTracker } from '../../components/payments/DailyPaymentTracker';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { supabase } from '../../services/supabase';

interface EnhancedDashboardStats {
  totalCustomers: number;
  totalLoans: number;
  totalDisbursed: number;
  totalCollected: number;
  activeLoans: number;
  overdueLoans: number;
  totalAgents: number;
  totalBranches: number;
  todayPayments: number;
  todayCollection: number;
  collectionRate: number;
}

interface AgentPerformance {
  id: string;
  full_name: string;
  email: string;
  branch_name: string;
  customers_count: number;
  loans_count: number;
  total_disbursed: number;
  total_collected: number;
  active_loans: number;
  performance_score: number;
}

interface RecentActivity {
  id: string;
  type: 'customer_registered' | 'loan_disbursed' | 'payment_received';
  description: string;
  amount?: number;
  created_at: string;
  customer_name?: string;
  agent_name?: string;
}

interface BranchOverview {
  id: string;
  name: string;
  total_customers: number;
  active_loans: number;
  total_disbursed: number;
  total_collected: number;
  agents_count: number;
  subadmins_count: number;
  performance_rating: 'excellent' | 'good' | 'average' | 'poor';
}

export const EnhancedAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'payments' | 'analytics'>('overview');
  const [stats, setStats] = useState<EnhancedDashboardStats | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [branchOverview, setBranchOverview] = useState<BranchOverview[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadAgentPerformance(),
        loadRecentActivity(),
        loadBranchOverview()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: customers } = await supabase.from('customers').select('id', { count: 'exact' });
      const { data: loans } = await supabase.from('loans').select('id, principal_amount, status', { count: 'exact' });
      const { data: payments } = await supabase.from('payments').select('amount, created_at');
      const { data: agents } = await supabase.from('users').select('id', { count: 'exact' }).eq('role', 'agent');
      const { data: branches } = await supabase.from('branches').select('id', { count: 'exact' });

      const today = new Date().toISOString().split('T')[0];
      const todayPayments = payments?.filter(p => p.created_at.startsWith(today)) || [];

      const totalDisbursed = loans?.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0) || 0;
      const totalCollected = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const activeLoans = loans?.filter(loan => loan.status === 'active').length || 0;
      const overdueLoans = loans?.filter(loan => loan.status === 'overdue').length || 0;

      setStats({
        totalCustomers: customers?.length || 0,
        totalLoans: loans?.length || 0,
        totalDisbursed,
        totalCollected,
        activeLoans,
        overdueLoans,
        totalAgents: agents?.length || 0,
        totalBranches: branches?.length || 0,
        todayPayments: todayPayments.length,
        todayCollection: todayPayments.reduce((sum, p) => sum + p.amount, 0),
        collectionRate: totalDisbursed > 0 ? (totalCollected / totalDisbursed) * 100 : 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAgentPerformance = async () => {
    try {
      const { data: agents } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          branch_id,
          branches!inner(name)
        `)
        .eq('role', 'agent');

      if (!agents) return;

      const agentStats = await Promise.all(
        agents.map(async (agent) => {
          const [customersResult, loansResult, paymentsResult] = await Promise.all([
            supabase.from('customers').select('id', { count: 'exact' }).eq('agent_id', agent.id),
            supabase.from('loans').select('principal_amount, status').eq('agent_id', agent.id),
            supabase.from('payments').select('amount').eq('agent_id', agent.id)
          ]);

          const customers_count = customersResult.count || 0;
          const loans = loansResult.data || [];
          const payments = paymentsResult.data || [];

          const total_disbursed = loans.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0);
          const total_collected = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          const active_loans = loans.filter(loan => loan.status === 'active').length;

          // Calculate performance score (0-100)
          const performance_score = Math.min(100, 
            (customers_count * 10) + 
            (active_loans * 15) + 
            (total_collected > 0 ? Math.min(50, (total_collected / 100000) * 50) : 0)
          );

          return {
            id: agent.id,
            full_name: agent.full_name,
            email: agent.email,
            branch_name: (agent.branches as any)?.name || 'Unknown',
            customers_count,
            loans_count: loans.length,
            total_disbursed,
            total_collected,
            active_loans,
            performance_score: Math.round(performance_score)
          };
        })
      );

      setAgentPerformance(agentStats.sort((a, b) => b.performance_score - a.performance_score));
    } catch (error) {
      console.error('Error loading agent performance:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Get recent customers
      const { data: recentCustomers } = await supabase
        .from('customers')
        .select('id, full_name, created_at, users!inner(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent loans
      const { data: recentLoans } = await supabase
        .from('loans')
        .select('id, principal_amount, created_at, customers!inner(full_name), users!inner(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent payments
      const { data: recentPayments } = await supabase
        .from('payments')
        .select('id, amount, created_at, customers!inner(full_name), users!inner(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      recentCustomers?.forEach(customer => {
        activities.push({
          id: `customer-${customer.id}`,
          type: 'customer_registered',
          description: `New customer registered: ${customer.full_name}`,
          created_at: customer.created_at,
          customer_name: customer.full_name,
          agent_name: (customer.users as any)?.full_name
        });
      });

      recentLoans?.forEach(loan => {
        activities.push({
          id: `loan-${loan.id}`,
          type: 'loan_disbursed',
          description: `Loan disbursed to ${(loan.customers as any)?.full_name}`,
          amount: loan.principal_amount,
          created_at: loan.created_at,
          customer_name: (loan.customers as any)?.full_name,
          agent_name: (loan.users as any)?.full_name
        });
      });

      recentPayments?.forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment_received',
          description: `Payment received from ${(payment.customers as any)?.full_name}`,
          amount: payment.amount,
          created_at: payment.created_at,
          customer_name: (payment.customers as any)?.full_name,
          agent_name: (payment.users as any)?.full_name
        });
      });

      // Sort by date and take latest 10
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const loadBranchOverview = async () => {
    try {
      const { data: branches } = await supabase.from('branches').select('id, name');
      if (!branches) return;

      const branchStats = await Promise.all(
        branches.map(async (branch) => {
          const [customersResult, loansResult, paymentsResult, usersResult] = await Promise.all([
            supabase.from('customers').select('id', { count: 'exact' }).eq('branch_id', branch.id),
            supabase.from('loans').select('principal_amount, status').eq('branch_id', branch.id),
            supabase.from('payments').select('amount').eq('branch_id', branch.id),
            supabase.from('users').select('id, role').eq('branch_id', branch.id)
          ]);

          const total_customers = customersResult.count || 0;
          const loans = loansResult.data || [];
          const payments = paymentsResult.data || [];
          const users = usersResult.data || [];

          const total_disbursed = loans.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0);
          const total_collected = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          const active_loans = loans.filter(loan => loan.status === 'active').length;
          const agents_count = users.filter(user => user.role === 'agent').length;
          const subadmins_count = users.filter(user => user.role === 'subadmin').length;

          // Calculate performance rating
          const collectionRate = total_disbursed > 0 ? (total_collected / total_disbursed) * 100 : 0;
          let performance_rating: 'excellent' | 'good' | 'average' | 'poor';
          
          if (collectionRate >= 90) performance_rating = 'excellent';
          else if (collectionRate >= 75) performance_rating = 'good';
          else if (collectionRate >= 60) performance_rating = 'average';
          else performance_rating = 'poor';

          return {
            id: branch.id,
            name: branch.name,
            total_customers,
            active_loans,
            total_disbursed,
            total_collected,
            agents_count,
            subadmins_count,
            performance_rating
          };
        })
      );

      setBranchOverview(branchStats);
    } catch (error) {
      console.error('Error loading branch overview:', error);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getBranchRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'customer_registered': return '👤';
      case 'loan_disbursed': return '💰';
      case 'payment_received': return '💳';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white mt-4">Loading enhanced dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <BackgroundAnimation />
      
      <div className="relative z-10">
        {/* Header */}
        <nav className="glass-navbar p-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Millennium Potter - Enhanced Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {profile?.full_name}</span>
              <Badge className="bg-yellow-500/20 text-yellow-400">Admin</Badge>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="glass-card p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Customers</p>
                  <p className="text-3xl font-bold text-white">{stats?.totalCustomers || 0}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </Card>

            <Card className="glass-card p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Loans</p>
                  <p className="text-3xl font-bold text-white">{stats?.activeLoans || 0}</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </Card>

            <Card className="glass-card p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Disbursed</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalDisbursed || 0)}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </Card>

            <Card className="glass-card p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Collection Rate</p>
                  <p className="text-3xl font-bold text-white">{stats?.collectionRate.toFixed(1) || 0}%</p>
                </div>
                <div className="text-4xl">📈</div>
              </div>
            </Card>

            <Card className="glass-card p-6 border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Today's Collection</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats?.todayCollection || 0)}</p>
                </div>
                <div className="text-4xl">💳</div>
              </div>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: '📊' },
                { key: 'agents', label: 'Agent Performance', icon: '👥' },
                { key: 'payments', label: 'Daily Payments', icon: '💳' },
                { key: 'analytics', label: 'Analytics', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium ${
                    activeTab === tab.key
                      ? 'border-yellow-500 text-yellow-400'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Branch Overview */}
              <Card className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🏢 Branch Overview</h3>
                <div className="space-y-4">
                  {branchOverview.map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">{branch.name}</h4>
                        <p className="text-sm text-gray-400">
                          {branch.total_customers} customers • {branch.active_loans} active loans
                        </p>
                        <p className="text-sm text-gray-400">
                          {branch.agents_count} agents • {branch.subadmins_count} sub-admins
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getBranchRatingColor(branch.performance_rating)}>
                          {branch.performance_rating}
                        </Badge>
                        <p className="text-sm text-green-400 mt-1">
                          {formatCurrency(branch.total_collected)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">📋 Recent Activity</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.description}</p>
                        {activity.amount && (
                          <p className="text-green-400 text-sm font-semibold">
                            {formatCurrency(activity.amount)}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs">
                          {formatDate(activity.created_at)} • {activity.agent_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'agents' && (
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">👥 Agent Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 pb-3">Agent</th>
                      <th className="text-left text-gray-400 pb-3">Branch</th>
                      <th className="text-left text-gray-400 pb-3">Customers</th>
                      <th className="text-left text-gray-400 pb-3">Active Loans</th>
                      <th className="text-left text-gray-400 pb-3">Disbursed</th>
                      <th className="text-left text-gray-400 pb-3">Collected</th>
                      <th className="text-left text-gray-400 pb-3">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentPerformance.map((agent) => (
                      <tr key={agent.id} className="border-b border-gray-700/50 hover:bg-white/5">
                        <td className="py-3 text-white">
                          <div>
                            <div className="font-semibold">{agent.full_name}</div>
                            <div className="text-xs text-gray-400">{agent.email}</div>
                          </div>
                        </td>
                        <td className="py-3 text-gray-300">{agent.branch_name}</td>
                        <td className="py-3 text-white">{agent.customers_count}</td>
                        <td className="py-3 text-white">{agent.active_loans}</td>
                        <td className="py-3 text-green-400">{formatCurrency(agent.total_disbursed)}</td>
                        <td className="py-3 text-blue-400">{formatCurrency(agent.total_collected)}</td>
                        <td className="py-3">
                          <Badge className={getPerformanceColor(agent.performance_score)}>
                            {agent.performance_score}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'payments' && (
            <DailyPaymentTracker />
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">📈 Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Collection Rate</span>
                    <span className="text-white font-semibold">{stats?.collectionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Agents</span>
                    <span className="text-white font-semibold">{stats?.totalAgents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Branches</span>
                    <span className="text-white font-semibold">{stats?.totalBranches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Overdue Loans</span>
                    <span className="text-red-400 font-semibold">{stats?.overdueLoans}</span>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">💰 Financial Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Disbursed</span>
                    <span className="text-green-400 font-semibold">{formatCurrency(stats?.totalDisbursed || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Collected</span>
                    <span className="text-blue-400 font-semibold">{formatCurrency(stats?.totalCollected || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Outstanding Amount</span>
                    <span className="text-yellow-400 font-semibold">
                      {formatCurrency((stats?.totalDisbursed || 0) - (stats?.totalCollected || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Today's Collection</span>
                    <span className="text-purple-400 font-semibold">{formatCurrency(stats?.todayCollection || 0)}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomerId && (
        <CustomerDetailModal
          isOpen={showCustomerModal}
          onClose={() => {
            setShowCustomerModal(false);
            setSelectedCustomerId(null);
          }}
          customerId={selectedCustomerId}
        />
      )}
    </div>
  );
};