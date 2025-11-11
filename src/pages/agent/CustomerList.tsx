import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerService } from '../../services/customerService';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { formatDate, formatPhone } from '../../utils/formatters';

export const CustomerList = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = customers.filter(customer =>
        customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.id_number.includes(searchQuery)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    try {
      if (!profile) return;
      setLoading(true);
      const data = await CustomerService.getCustomersByAgent(profile.id);
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const columns = [
    {
      key: 'full_name',
      header: 'Customer Name',
      render: (customer: any) => (
        <div>
          <p className="font-semibold text-white">{customer.full_name}</p>
          <p className="text-sm text-gray-400">{formatPhone(customer.phone)}</p>
        </div>
      ),
    },
    {
      key: 'id_type',
      header: 'ID Information',
      render: (customer: any) => (
        <div>
          <p className="text-white">{customer.id_type}</p>
          <p className="text-sm text-gray-400">{customer.id_number}</p>
        </div>
      ),
    },
    {
      key: 'guarantors',
      header: 'Guarantors',
      render: (customer: any) => (
        <span className="text-white">{customer.guarantors?.length || 0}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Registered',
      render: (customer: any) => (
        <span className="text-gray-300">{formatDate(customer.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (customer: any) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleViewCustomer(customer)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 relative" style={{ backgroundColor: '#0F172A' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/agent/dashboard')}>
            ← Back to Dashboard
          </Button>
          <Button variant="gold" onClick={() => navigate('/agent/register-customer')}>
            + Register New Customer
          </Button>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Customers</h1>
              <p className="text-gray-400">Manage your registered customers</p>
            </div>
            <div className="w-80">
              <Input
                placeholder="Search by name, phone, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
          </div>

          <Table
            data={filteredCustomers}
            columns={columns}
            loading={loading}
            emptyMessage="No customers found. Register your first customer!"
          />

          {!loading && customers.length > 0 && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-gray-400">
                Total Customers: <span className="text-white font-semibold">{customers.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Full Name</p>
                  <p className="text-white font-semibold">{selectedCustomer.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white">{formatPhone(selectedCustomer.phone)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{selectedCustomer.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">ID Type</p>
                  <p className="text-white">{selectedCustomer.id_type}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-white">{selectedCustomer.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">ID Number</p>
                  <p className="text-white">{selectedCustomer.id_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Registered</p>
                  <p className="text-white">{formatDate(selectedCustomer.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Guarantors */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Guarantors ({selectedCustomer.guarantors?.length || 0})</h3>
              {selectedCustomer.guarantors?.length > 0 ? (
                <div className="space-y-4">
                  {selectedCustomer.guarantors.map((guarantor: any, index: number) => (
                    <div key={guarantor.id} className="p-4 bg-white/5 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Guarantor {index + 1}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400">Name</p>
                          <p className="text-white">{guarantor.full_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Phone</p>
                          <p className="text-white">{formatPhone(guarantor.phone)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Relationship</p>
                          <p className="text-white">{guarantor.relationship}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">ID Type</p>
                          <p className="text-white">{guarantor.id_type}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-400">Address</p>
                          <p className="text-white">{guarantor.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No guarantors found</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="gold"
                onClick={() => {
                  setShowModal(false);
                  navigate('/agent/apply-loan');
                }}
              >
                Apply for Loan
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};