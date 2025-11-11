import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerService } from '../../services/customerService';
import { Input, Select } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { ID_TYPES } from '../../utils/constants';

export const RegisterCustomer = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Customer data
  const [customer, setCustomer] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    id_type: '',
    id_number: '',
  });

  // Guarantors (minimum 1)
  const [guarantors, setGuarantors] = useState([
    { full_name: '', phone: '', address: '', relationship: '', id_type: '', id_number: '' }
  ]);

  const addGuarantor = () => {
    if (guarantors.length < 3) {
      setGuarantors([...guarantors, { full_name: '', phone: '', address: '', relationship: '', id_type: '', id_number: '' }]);
    }
  };

  const removeGuarantor = (index: number) => {
    if (guarantors.length > 1) {
      setGuarantors(guarantors.filter((_, i) => i !== index));
    }
  };

  const updateGuarantor = (index: number, field: string, value: string) => {
    const updated = [...guarantors];
    updated[index] = { ...updated[index], [field]: value };
    setGuarantors(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!profile) throw new Error('User profile not found');

      await CustomerService.createCustomer(
        {
          ...customer,
          branch_id: profile.branch_id!,
          agent_id: profile.id,
        },
        guarantors
      );

      setSuccess(true);
      setTimeout(() => {
        navigate('/agent/customers');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative" style={{ backgroundColor: '#0F172A' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate('/agent/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>

        <div className="glass-card p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Register New Customer</h1>
          <p className="text-gray-400 mb-8">Fill in customer and guarantor details</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
              ✅ Customer registered successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Details */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={customer.full_name}
                  onChange={(e) => setCustomer({ ...customer, full_name: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  required
                />
                <Input
                  label="Email (Optional)"
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
                <Input
                  label="Address"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  required
                />
                <Select
                  label="ID Type"
                  value={customer.id_type}
                  onChange={(e) => setCustomer({ ...customer, id_type: e.target.value })}
                  options={ID_TYPES.map(type => ({ value: type, label: type }))}
                  required
                />
                <Input
                  label="ID Number"
                  value={customer.id_number}
                  onChange={(e) => setCustomer({ ...customer, id_number: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Guarantors */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Guarantors (Minimum 1)</h2>
                {guarantors.length < 3 && (
                  <Button type="button" variant="gold" size="sm" onClick={addGuarantor}>
                    + Add Guarantor
                  </Button>
                )}
              </div>

              {guarantors.map((guarantor, index) => (
                <div key={index} className="mb-6 p-6 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Guarantor {index + 1}</h3>
                    {guarantors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGuarantor(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={guarantor.full_name}
                      onChange={(e) => updateGuarantor(index, 'full_name', e.target.value)}
                      required
                    />
                    <Input
                      label="Phone Number"
                      value={guarantor.phone}
                      onChange={(e) => updateGuarantor(index, 'phone', e.target.value)}
                      required
                    />
                    <Input
                      label="Address"
                      value={guarantor.address}
                      onChange={(e) => updateGuarantor(index, 'address', e.target.value)}
                      required
                    />
                    <Input
                      label="Relationship"
                      value={guarantor.relationship}
                      onChange={(e) => updateGuarantor(index, 'relationship', e.target.value)}
                      placeholder="e.g., Spouse, Sibling, Friend"
                      required
                    />
                    <Select
                      label="ID Type"
                      value={guarantor.id_type}
                      onChange={(e) => updateGuarantor(index, 'id_type', e.target.value)}
                      options={ID_TYPES.map(type => ({ value: type, label: type }))}
                      required
                    />
                    <Input
                      label="ID Number"
                      value={guarantor.id_number}
                      onChange={(e) => updateGuarantor(index, 'id_number', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" variant="gold" loading={loading} fullWidth>
                {loading ? 'Registering...' : 'Register Customer'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/agent/dashboard')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
