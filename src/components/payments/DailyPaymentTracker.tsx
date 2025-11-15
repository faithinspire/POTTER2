import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { paymentService } from '../../services/paymentService';
import { customerService } from '../../services/customerService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Payment } from '../../types/payment';
import { Customer } from '../../types/customer';

interface DailyPayment {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  payment_type: 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'missed';
  due_date: string;
  paid_date?: string;
  agent_id: string;
}

export const DailyPaymentTracker: React.FC = () => {
  const [payments, setPayments] = useState<DailyPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<DailyPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'missed'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDailyPayments();
  }, [selectedDate]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter]);

  const loadDailyPayments = async () => {
    try {
      setLoading(true);
      const paymentsData = await paymentService.getDailyPayments(selectedDate);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading daily payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customer_phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const markPaymentCompleted = async (paymentId: string, amount: number) => {
    try {
      await paymentService.recordPayment({
        customer_id: payments.find(p => p.id === paymentId)?.customer_id || '',
        amount,
        payment_type: 'daily',
        payment_date: new Date().toISOString(),
        notes: 'Daily payment collected'
      });
      
      // Update local state
      setPayments(prev => prev.map(payment =>
        payment.id === paymentId
          ? { ...payment, status: 'completed' as const, paid_date: new Date().toISOString() }
          : payment
      ));
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const markPaymentMissed = async (paymentId: string) => {
    try {
      // Update payment status to missed
      setPayments(prev => prev.map(payment =>
        payment.id === paymentId
          ? { ...payment, status: 'missed' as const }
          : payment
      ));
    } catch (error) {
      console.error('Error marking payment as missed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalStats = () => {
    const total = filteredPayments.length;
    const completed = filteredPayments.filter(p => p.status === 'completed').length;
    const pending = filteredPayments.filter(p => p.status === 'pending').length;
    const missed = filteredPayments.filter(p => p.status === 'missed').length;
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const collectedAmount = filteredPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return { total, completed, pending, missed, totalAmount, collectedAmount };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Payment Tracker</h2>
          <p className="text-gray-600">Track and manage daily customer payments</p>
        </div>
        <div className="flex space-x-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button onClick={loadDailyPayments} variant="primary">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Payments</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
            <div className="text-sm text-gray-600">Missed</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</div>
            <div className="text-sm text-gray-600">Total Expected</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{formatCurrency(stats.collectedAmount)}</div>
            <div className="text-sm text-gray-600">Collected</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'pending', 'completed', 'missed'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'secondary'}
                onClick={() => setStatusFilter(status as any)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Payments List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.customer_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.customer_phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {payment.payment_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.due_date)}
                    {payment.paid_date && (
                      <div className="text-xs text-green-600">
                        Paid: {formatDate(payment.paid_date)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {payment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => markPaymentCompleted(payment.id, payment.amount)}
                        >
                          Mark Paid
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => markPaymentMissed(payment.id)}
                        >
                          Mark Missed
                        </Button>
                      </div>
                    )}
                    {payment.status === 'completed' && (
                      <span className="text-green-600 text-sm">✓ Collected</span>
                    )}
                    {payment.status === 'missed' && (
                      <span className="text-red-600 text-sm">✗ Missed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payments found for the selected criteria
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};