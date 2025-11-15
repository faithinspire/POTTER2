import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerService } from '../../services/customerService';
import { Input, Select } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { ID_TYPES, NIGERIAN_STATES, MARITAL_STATUS } from '../../utils/constants';

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
    state_of_origin: '',
    occupation: '',
    next_of_kin_name: '',
    next_of_kin_address: '',
    business_address: '',
    marital_status: '',
    union_name: '',
  });

  // Photo upload
  const [customerPhoto, setCustomerPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Guarantors (minimum 1)
  const [guarantors, setGuarantors] = useState([
    { full_name: '', phone: '', address: '', relationship: '', id_type: '', id_number: '', state_of_origin: '' }
  ]);

  const addGuarantor = () => {
    if (guarantors.length < 3) {
      setGuarantors([...guarantors, { full_name: '', phone: '', address: '', relationship: '', id_type: '', id_number: '', state_of_origin: '' }]);
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setCustomerPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear any previous errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!profile) throw new Error('User profile not found');

      // Ensure all fields have values (not empty strings that might violate constraints)
      const customerData = {
        ...customer,
        id_type: customer.id_type as any,
        branch_id: profile.branch_id!,
        agent_id: profile.id,
        state_of_origin: customer.state_of_origin || null,
        occupation: customer.occupation || null,
        next_of_kin_name: customer.next_of_kin_name || null,
        next_of_kin_address: customer.next_of_kin_address || null,
        business_address: customer.business_address || null,
        marital_status: customer.marital_status || null,
        union_name: customer.union_name || null,
      };

      await CustomerService.createCustomer(
        customerData,
        guarantors.map(g => ({
          ...g,
          id_type: g.id_type as any,
          state_of_origin: g.state_of_origin || null
        }))
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
              
              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer Photo
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400 focus:outline-none focus:border-yellow-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Upload customer photo (JPG, PNG, max 5MB)
                    </p>
                  </div>
                  {photoPreview && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-700">
                      <img
                        src={photoPreview}
                        alt="Customer preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

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
                <Select
                  label="State of Origin"
                  value={customer.state_of_origin}
                  onChange={(e) => setCustomer({ ...customer, state_of_origin: e.target.value })}
                  options={NIGERIAN_STATES.map(state => ({ value: state, label: state }))}
                  required
                />
                <Input
                  label="Occupation"
                  value={customer.occupation}
                  onChange={(e) => setCustomer({ ...customer, occupation: e.target.value })}
                  required
                />
                <Select
                  label="Marital Status"
                  value={customer.marital_status}
                  onChange={(e) => setCustomer({ ...customer, marital_status: e.target.value })}
                  options={MARITAL_STATUS.map(status => ({ value: status.toLowerCase(), label: status }))}
                  required
                />
                <Input
                  label="Home Address"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  required
                />
                <Input
                  label="Business Address"
                  value={customer.business_address}
                  onChange={(e) => setCustomer({ ...customer, business_address: e.target.value })}
                  required
                />
                <Input
                  label="Union Name"
                  value={customer.union_name}
                  onChange={(e) => setCustomer({ ...customer, union_name: e.target.value })}
                  placeholder="e.g., Traders Union, Artisan Association"
                />
                <div></div> {/* Empty div for grid alignment */}
              </div>

              {/* Next of Kin Section */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Next of Kin Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Next of Kin Name"
                    value={customer.next_of_kin_name}
                    onChange={(e) => setCustomer({ ...customer, next_of_kin_name: e.target.value })}
                    required
                  />
                  <Input
                    label="Next of Kin Address"
                    value={customer.next_of_kin_address}
                    onChange={(e) => setCustomer({ ...customer, next_of_kin_address: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* ID Information */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Identification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Select
                      label="State of Origin"
                      value={guarantor.state_of_origin}
                      onChange={(e) => updateGuarantor(index, 'state_of_origin', e.target.value)}
                      options={NIGERIAN_STATES.map(state => ({ value: state, label: state }))}
                      required
                    />
                    <Input
                      label="Relationship"
                      value={guarantor.relationship}
                      onChange={(e) => updateGuarantor(index, 'relationship', e.target.value)}
                      placeholder="e.g., Spouse, Sibling, Friend"
                      required
                    />
                    <div></div> {/* Empty div for grid alignment */}
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
