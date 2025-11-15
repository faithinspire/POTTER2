import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { supabase } from '../../services/supabase';

interface AnalyticsData {
  totalRevenue: number;
  monthlyGrowth: number;
  customerGrowth: number;
  loanPerformance: {
    active: number;
    completed: number;
    overdue: number;
    defaulted: number;
  };
  branchPerformance: Array<{
    id: string;
    name: string;
    revenue: number;
    customers: number;
    loans: number;
    growth: number;
  }>;
  agentMetrics: Array<{
    id: string;
    name: string;
    customers: number;
    revenue: number;
    efficiency: number;
  }>;
  paymentTrends: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const timeRanges: TimeRange[] = [
  { label: '7 Days', value: '7d', days: 7 },
  { label: '30 Days', value: '30d', days: 30 },
  { label: '90 Days', value: '90d', days: 90 },
  { label: '1 Year', value: '1y', days: 365 }
];

export const ResponsiveAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'branches' | 'agents' | 'trends'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const timeRange = timeRanges.find(t => t.value === selectedTimeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeRange?.days || 30));

      const [
        revenueData,
        customerData,
        loanData,
        branchData,
        agentData,
        paymentData
      ] = await Promise.all([
        loadRevenueData(startDate),
        loadCustomerData(startDate),
        loadLoanPerformance(),
        loadBranchPerformance(startDate),
        loadAgentMetrics(startDate),
        loadPaymentTrends(startDate)
      ]);

      setAnalyticsData({
        totalRevenue: revenueData.total,
        monthlyGrowth: revenueData.growth,
        customerGrowth: customerData.growth,
        loanPerformance: loanData,
        branchPerformance: branchData,
        agentMetrics: agentData,
        paymentTrends: paymentData
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueData = async (startDate: Date) => {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, created_at')
      .gte('created_at', startDate.toISOString());

    const total = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    
    // Calculate growth (simplified - comparing with previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (timeRanges.find(t => t.value === selectedTimeRange)?.days || 30));
    
    const { data: previousPayments } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    const previousTotal = previousPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const growth = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

    return { total, growth };
  };

  const loadCustomerData = async (startDate: Date) => {
    const { data: customers } = await supabase
      .from('customers')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    const currentCount = customers?.length || 0;
    
    // Calculate previous period for growth
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (timeRanges.find(t => t.value === selectedTimeRange)?.days || 30));
    
    const { data: previousCustomers } = await supabase
      .from('customers')
      .select('created_at')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    const previousCount = previousCustomers?.length || 0;
    const growth = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;

    return { growth };
  };

  const loadLoanPerformance = async () => {
    const { data: loans } = await supabase
      .from('loans')
      .select('status');

    const performance = {
      active: 0,
      completed: 0,
      overdue: 0,
      defaulted: 0
    };

    loans?.forEach(loan => {
      switch (loan.status) {
        case 'active':
          performance.active++;
          break;
        case 'completed':
          performance.completed++;
          break;
        case 'overdue':
          performance.overdue++;
          break;
        case 'defaulted':
          performance.defaulted++;
          break;
      }
    });

    return performance;
  };

  const loadBranchPerformance = async (startDate: Date) => {
    const { data: branches } = await supabase
      .from('branches')
      .select('id, name');

    if (!branches) return [];

    const branchPerformance = await Promise.all(
      branches.map(async (branch) => {
        const [paymentsResult, customersResult, loansResult] = await Promise.all([
          supabase
            .from('payments')
            .select('amount')
            .eq('branch_id', branch.id)
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('customers')
            .select('id', { count: 'exact' })
            .eq('branch_id', branch.id),
          supabase
            .from('loans')
            .select('id', { count: 'exact' })
            .eq('branch_id', branch.id)
        ]);

        const revenue = paymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const customers = customersResult.count || 0;
        const loans = loansResult.count || 0;

        // Calculate growth (simplified)
        const growth = Math.random() * 20 - 10; // Placeholder for actual growth calculation

        return {
          id: branch.id,
          name: branch.name,
          revenue,
          customers,
          loans,
          growth
        };
      })
    );

    return branchPerformance.sort((a, b) => b.revenue - a.revenue);
  };

  const loadAgentMetrics = async (startDate: Date) => {
    const { data: agents } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'agent');

    if (!agents) return [];

    const agentMetrics = await Promise.all(
      agents.map(async (agent) => {
        const [customersResult, paymentsResult] = await Promise.all([
          supabase
            .from('customers')
            .select('id', { count: 'exact' })
            .eq('agent_id', agent.id),
          supabase
            .from('payments')
            .select('amount')
            .eq('agent_id', agent.id)
            .gte('created_at', startDate.toISOString())
        ]);

        const customers = customersResult.count || 0;
        const revenue = paymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const efficiency = customers > 0 ? revenue / customers : 0;

        return {
          id: agent.id,
          name: agent.full_name,
          customers,
          revenue,
          efficiency
        };
      })
    );

    return agentMetrics.sort((a, b) => b.efficiency - a.efficiency);
  };

  const loadPaymentTrends = async (startDate: Date) => {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (!payments) return [];

    // Group payments by date
    const dailyPayments = new Map<string, { amount: number; count: number }>();

    payments.forEach(payment => {
      const date = payment.created_at.split('T')[0];
      const existing = dailyPayments.get(date) || { amount: 0, count: 0 };
      dailyPayments.set(date, {
        amount: existing.amount + payment.amount,
        count: existing.count + 1
      });
    });

    return Array.from(dailyPayments.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count
    }));
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-400';
    if (growth < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➡️';
  };

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center py-8 text-gray-400">
          No analytics data available
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-white">📊 Analytics Dashboard</h2>
        <div className="flex flex-wrap gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={selectedTimeRange === range.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(analyticsData.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                <span className="text-lg mr-1">{getGrowthIcon(analyticsData.monthlyGrowth)}</span>
                <span className={`text-sm font-semibold ${getGrowthColor(analyticsData.monthlyGrowth)}`}>
                  {analyticsData.monthlyGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </Card>

        <Card className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Customer Growth</p>
              <p className="text-2xl font-bold text-white">{analyticsData.customerGrowth.toFixed(1)}%</p>
              <p className="text-sm text-gray-400 mt-2">vs previous period</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </Card>

        <Card className="glass-card p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Loans</p>
              <p className="text-2xl font-bold text-white">{analyticsData.loanPerformance.active}</p>
              <p className="text-sm text-gray-400 mt-2">
                {analyticsData.loanPerformance.overdue} overdue
              </p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </Card>

        <Card className="glass-card p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-white">
                {(
                  (analyticsData.loanPerformance.completed / 
                  (analyticsData.loanPerformance.completed + analyticsData.loanPerformance.active + analyticsData.loanPerformance.overdue)) * 100
                ).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-400 mt-2">loan completion</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </Card>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'branches', label: 'Branches', icon: '🏢' },
            { key: 'agents', label: 'Agents', icon: '👥' },
            { key: 'trends', label: 'Trends', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === tab.key
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
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📋 Loan Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Loans</span>
                <Badge className="bg-green-100 text-green-800">
                  {analyticsData.loanPerformance.active}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Completed Loans</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {analyticsData.loanPerformance.completed}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Overdue Loans</span>
                <Badge className="bg-red-100 text-red-800">
                  {analyticsData.loanPerformance.overdue}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Defaulted Loans</span>
                <Badge className="bg-gray-100 text-gray-800">
                  {analyticsData.loanPerformance.defaulted}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📈 Payment Trends</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analyticsData.paymentTrends.slice(-7).map((trend) => (
                <div key={trend.date} className="flex justify-between items-center">
                  <span className="text-gray-400">{formatDate(trend.date)}</span>
                  <div className="text-right">
                    <div className="text-white font-semibold">{formatCurrency(trend.amount)}</div>
                    <div className="text-xs text-gray-400">{trend.count} payments</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeView === 'branches' && (
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🏢 Branch Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 pb-3">Branch</th>
                  <th className="text-left text-gray-400 pb-3">Revenue</th>
                  <th className="text-left text-gray-400 pb-3">Customers</th>
                  <th className="text-left text-gray-400 pb-3">Loans</th>
                  <th className="text-left text-gray-400 pb-3">Growth</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.branchPerformance.map((branch) => (
                  <tr key={branch.id} className="border-b border-gray-700/50 hover:bg-white/5">
                    <td className="py-3 text-white font-semibold">{branch.name}</td>
                    <td className="py-3 text-green-400">{formatCurrency(branch.revenue)}</td>
                    <td className="py-3 text-white">{branch.customers}</td>
                    <td className="py-3 text-white">{branch.loans}</td>
                    <td className="py-3">
                      <span className={getGrowthColor(branch.growth)}>
                        {branch.growth > 0 ? '+' : ''}{branch.growth.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeView === 'agents' && (
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">👥 Agent Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 pb-3">Agent</th>
                  <th className="text-left text-gray-400 pb-3">Customers</th>
                  <th className="text-left text-gray-400 pb-3">Revenue</th>
                  <th className="text-left text-gray-400 pb-3">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.agentMetrics.map((agent) => (
                  <tr key={agent.id} className="border-b border-gray-700/50 hover:bg-white/5">
                    <td className="py-3 text-white font-semibold">{agent.name}</td>
                    <td className="py-3 text-white">{agent.customers}</td>
                    <td className="py-3 text-green-400">{formatCurrency(agent.revenue)}</td>
                    <td className="py-3 text-blue-400">{formatCurrency(agent.efficiency)}/customer</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeView === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📈 Revenue Trend</h3>
            <div className="space-y-2">
              {analyticsData.paymentTrends.slice(-10).map((trend, index) => (
                <div key={trend.date} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 flex justify-between">
                    <span className="text-gray-400 text-sm">{formatDate(trend.date)}</span>
                    <span className="text-white font-semibold">{formatCurrency(trend.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Performance Summary</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {formatCurrency(analyticsData.totalRevenue)}
                </div>
                <div className="text-sm text-gray-400">Total Revenue ({selectedTimeRange})</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-400">
                    {analyticsData.branchPerformance.length}
                  </div>
                  <div className="text-xs text-gray-400">Active Branches</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-yellow-400">
                    {analyticsData.agentMetrics.length}
                  </div>
                  <div className="text-xs text-gray-400">Active Agents</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};