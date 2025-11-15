import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { customerService } from '../../services/customerService';
import { loanService } from '../../services/loanService';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Customer } from '../../types/customer';
import { Loan } from '../../types/loan';
import { Payment } from '../../types/payment';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customerId
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'loans' | 'payments'>('details');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomerData();
    }
  }, [isOpen, customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const [customerData, loansData, paymentsData] = await Promise.all([
        customerService.getCustomerById(customerId),
        loanService.getLoansByCustomer(customerId),
        paymentService.getPaymentsByCustomer(customerId)
      ]);
      
      setCustomer(customerData);
      setLoans(loansData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Customer Details">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Modal>
    );
  }

  if (!customer) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Customer Details">
        <div className="text-center py-8 text-gray-500">
          Customer not found
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Details" size="large">
      <div className="space-y-6">
        {/* Customer Header */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          {customer.photo_url ? (
            <img
              src={customer.photo_url}
              alt={customer.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
              {customer.full_name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{customer.full_name}</h3>
            <p className="text-gray-600">{customer.phone_number}</p>
            <p className="text-gray-600">{customer.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'details', label: 'Personal Details' },
              { key: 'loans', label: `Loans (${loans.length})` },
              { key: 'payments', label: `Payments (${payments.length})` }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.phone_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State of Origin</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.state_of_origin || 'Not provided'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.occupation || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.marital_status || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Next of Kin</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.next_of_kin_name || 'Not provided'}</p>
                  {customer.next_of_kin_phone && (
                    <p className="text-sm text-gray-600">{customer.next_of_kin_phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Union Name</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.union_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(customer.created_at)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="space-y-4">
              {loans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No loans found for this customer
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loan ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interest
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loans.map((loan) => (
                        <tr key={loan.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {loan.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(loan.principal_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(loan.interest_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(loan.status)}>
                              {loan.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(loan.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payments found for this customer
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment ID
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
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.payment_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};