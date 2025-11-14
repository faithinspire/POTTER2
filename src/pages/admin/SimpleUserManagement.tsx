import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { supabase } from '../../services/supabase';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const SimpleUserManagement = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('🔄 Loading users...');
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading users:', error);
        setError('Failed to load users: ' + error.message);
      } else {
        console.log('✅ Users loaded:', data);
        setUsers(data || []);
      }
    } catch (err: any) {
      console.error('❌ Exception loading users:', err);
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    try {
      const testEmail = `test${Date.now()}@example.com`;
      
      console.log('🔄 Creating test user:', testEmail);
      
      const { data, error } = await supabase.rpc('create_user', {
        user_email: testEmail,
        user_password: 'password123',
        user_full_name: 'Test User',
        user_phone: '+234 800 000 0001',
        user_role: 'agent',
        user_branch_id: null
      });

      if (error) {
        console.error('❌ Error creating user:', error);
        alert('Failed to create user: ' + error.message);
      } else {
        console.log('✅ User created:', data);
        alert('Test user created successfully!\nEmail: ' + testEmail + '\nPassword: password123');
        loadUsers(); // Refresh the list
      }
    } catch (err: any) {
      console.error('❌ Exception creating user:', err);
      alert('Failed to create user: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white mt-4">Loading users...</p>
        </div>
      </div>
    );
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
              <span className="text-white text-sm sm:text-base">Welcome, {profile?.full_name || profile?.email}</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs sm:text-sm font-semibold">
                Admin
              </span>
              <Button variant="secondary" size="sm" onClick={() => navigate('/admin/dashboard')}>
                Dashboard
              </Button>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">User Management</h2>
            <div className="flex gap-2">
              <Button variant="gold" size="sm" onClick={createTestUser}>
                + Create Test User
              </Button>
              <Button variant="primary" size="sm" onClick={loadUsers}>
                🔄 Refresh
              </Button>
            </div>
          </div>

          {error && (
            <Card className="glass-card p-4 mb-6 border-l-4 border-l-red-500">
              <div className="text-red-200">
                <strong>Error:</strong> {error}
              </div>
            </Card>
          )}

          {/* Users List */}
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              All Users ({users.length})
            </h3>
            
            {users.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👥</div>
                <p className="text-gray-400 mb-4">No users found</p>
                <Button variant="gold" onClick={createTestUser}>
                  Create First User
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 pb-3 px-2">Email</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Name</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Role</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Status</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700/50">
                        <td className="py-3 px-2 text-white">{user.email}</td>
                        <td className="py-3 px-2 text-white">{user.full_name || 'Not set'}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' :
                            user.role === 'subadmin' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Instructions */}
          <Card className="glass-card p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">How to Add Users</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-blue-400">1.</span>
                <div>
                  <strong>Create Test User:</strong> Click "Create Test User" button above to generate a test user with random email
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400">2.</span>
                <div>
                  <strong>Use Signup Page:</strong> Go to <code className="bg-gray-800 px-2 py-1 rounded">/signup</code> to create users manually
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400">3.</span>
                <div>
                  <strong>Database Direct:</strong> Use Supabase SQL Editor to run <code className="bg-gray-800 px-2 py-1 rounded">create_user()</code> function
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};