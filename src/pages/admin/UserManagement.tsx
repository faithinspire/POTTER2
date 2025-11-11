import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../services/userService';
import { AuthService } from '../../services/authService';
import { Button } from '../../components/shared/Button';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { Input } from '../../components/shared/Input';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { formatDate } from '../../utils/formatters';
import { supabase } from '../../services/supabase';

export const UserManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    subadmins: 0,
    agents: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [createdUserInfo, setCreatedUserInfo] = useState({ email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'agent' as 'admin' | 'subadmin' | 'agent',
    branch_id: '',
  });

  useEffect(() => {
    loadUsers();
    loadStats();
    loadBranches();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await UserService.getUserStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadBranches = async () => {
    try {
      const { data } = await supabase.from('branches').select('*');
      setBranches(data || []);
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.full_name || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.role !== 'admin' && !formData.branch_id) {
      alert('Please select a branch for sub-admin or agent');
      return;
    }

    try {
      setCreating(true);
      await AuthService.registerUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
        branch_id: formData.role === 'admin' ? undefined : formData.branch_id,
      });

      // Save credentials to show in success modal
      setCreatedUserInfo({
        email: formData.email,
        password: formData.password,
      });

      // Close create modal and show success modal
      setShowCreateModal(false);
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'agent',
        branch_id: '',
      });
      
      loadUsers();
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await UserService.deleteUser(userToDelete.id);
      alert('User deleted successfully!');
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'full_name',
      header: 'User',
      render: (user: any) => (
        <div>
          <p className="font-semibold text-white">{user.full_name}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' :
          user.role === 'subadmin' ? 'bg-blue-500/20 text-blue-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {user.role === 'admin' ? 'Admin' : user.role === 'subadmin' ? 'Sub-Admin' : 'Agent'}
        </span>
      ),
    },
    {
      key: 'branch_name',
      header: 'Branch',
      render: (user: any) => (
        <span className="text-white">{user.branch_name || 'Global'}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (user: any) => (
        <span className="text-gray-300">{user.phone}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (user: any) => (
        <span className="text-gray-300">{formatDate(user.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: any) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            setUserToDelete(user);
            setShowDeleteModal(true);
          }}
        >
          🗑️ Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 relative" style={{ backgroundColor: '#0F172A' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </Button>
          <Button variant="gold" onClick={() => setShowCreateModal(true)}>
            + Add New User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Admins</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.admins}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Sub-Admins</p>
            <p className="text-2xl font-bold text-blue-400">{stats.subadmins}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Agents</p>
            <p className="text-2xl font-bold text-green-400">{stats.agents}</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400 mb-6">Manage all users across both branches</p>

          <Table
            data={users}
            columns={columns}
            loading={loading}
            emptyMessage="No users found"
          />

          {!loading && users.length > 0 && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">User Distribution:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Igando Branch</p>
                  <p className="text-white font-semibold">
                    {users.filter(u => u.branch_name === 'Igando').length} users
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Abule-Egba Branch</p>
                  <p className="text-white font-semibold">
                    {users.filter(u => u.branch_name === 'Abule-Egba').length} users
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Global Access</p>
                  <p className="text-white font-semibold">
                    {users.filter(u => u.role === 'admin').length} admins
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Field Agents</p>
                  <p className="text-white font-semibold">
                    {users.filter(u => u.role === 'agent').length} agents
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
      >
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>Note:</strong> If you get "Database error", create users via Supabase Dashboard instead.
            See CREATE_USERS_WORKAROUND.md for instructions.
          </p>
        </div>
        
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            required
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+234 800 000 0000"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                required
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={generatePassword}
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              💡 Tip: Use "Agent2024!" for easy sharing
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-gold"
              required
            >
              <option value="agent">Agent</option>
              <option value="subadmin">Sub-Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role !== 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Branch
              </label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-gold"
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong>Note:</strong> The user will receive an email to verify their account.
              They can login immediately with the provided credentials.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="gold" loading={creating} fullWidth>
              {creating ? 'Creating...' : 'Create User'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Success Modal - Show Credentials */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="✅ User Created Successfully!"
      >
        <div className="space-y-4">
          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-200 font-semibold mb-2">
              The user account has been created!
            </p>
            <p className="text-sm text-green-300">
              Share these credentials with the user immediately.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Email (Login Username)</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono">{createdUserInfo.email}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(createdUserInfo.email)}
                >
                  📋 Copy
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Password</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono text-lg">{createdUserInfo.password}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(createdUserInfo.password)}
                >
                  📋 Copy
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Full Credentials</p>
              <Button
                variant="gold"
                size="sm"
                fullWidth
                onClick={() => copyToClipboard(
                  `Login Details:\nEmail: ${createdUserInfo.email}\nPassword: ${createdUserInfo.password}\n\nLogin at: ${window.location.origin}`
                )}
              >
                📋 Copy All (for WhatsApp/SMS)
              </Button>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-sm text-yellow-200">
              <strong>⚠️ Important:</strong> This is the only time you'll see this password.
              Make sure to share it with the user via phone, WhatsApp, or SMS.
            </p>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">
              <strong>📱 Sample Message:</strong>
            </p>
            <p className="text-xs text-gray-400 font-mono whitespace-pre-line">
              {`Welcome to Millennium Potter!

Your login details:
Email: ${createdUserInfo.email}
Password: ${createdUserInfo.password}

Login at: ${window.location.origin}

Please login and start working!`}
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => setShowSuccessModal(false)}
          >
            Done
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        title="⚠️ Delete User"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 font-semibold mb-2">
              Are you sure you want to delete this user?
            </p>
            <p className="text-sm text-red-300">
              This action cannot be undone!
            </p>
          </div>

          {userToDelete && (
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white font-semibold">{userToDelete.full_name}</p>
              <p className="text-sm text-gray-400">{userToDelete.email}</p>
              <p className="text-sm text-gray-400">Role: {userToDelete.role}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="danger"
              fullWidth
              onClick={handleDeleteUser}
              loading={deleting}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Yes, Delete User'}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};