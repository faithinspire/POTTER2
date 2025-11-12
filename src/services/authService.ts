import { supabase } from './supabase';
import { UserProfile } from '../types/user';

export class AuthService {
  /**
   * Sign in with email and password - CUSTOM AUTH (NO SUPABASE AUTH)
   */
  static async signIn(email: string, password: string) {
    try {
      // Call custom authentication function
      const { data, error } = await supabase.rpc('authenticate_user', {
        user_email: email,
        user_password: password
      });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = data[0];
      
      // Create session token
      const sessionToken = btoa(JSON.stringify({
        id: user.id,
        email: user.email,
        timestamp: Date.now()
      }));

      // Store in localStorage
      localStorage.setItem('auth_token', sessionToken);
      localStorage.setItem('user_profile', JSON.stringify(user));

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      const profile: UserProfile = {
        id: user.id,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id,
        branch_name: user.branch_name,
        full_name: user.full_name,
        phone: user.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return { user: { id: user.id, email: user.email }, session: { access_token: sessionToken }, profile };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Sign out current user - CUSTOM AUTH
   */
  static async signOut() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_profile');
  }

  /**
   * Get current session - CUSTOM AUTH
   */
  static async getSession() {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    return { access_token: token };
  }

  /**
   * Get current user - CUSTOM AUTH
   */
  static async getCurrentUser() {
    const profileStr = localStorage.getItem('user_profile');
    if (!profileStr) return null;
    
    const profile = JSON.parse(profileStr);
    return { id: profile.id, email: profile.email };
  }

  /**
   * Get user profile with role and branch information - CUSTOM AUTH
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const profileStr = localStorage.getItem('user_profile');
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      if (profile.id === userId) {
        return profile;
      }
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        branch:branches(name)
      `)
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      role: data.role,
      branch_id: data.branch_id,
      branch_name: data.branch?.name || null,
      full_name: data.full_name,
      phone: data.phone,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    localStorage.setItem('user_profile', JSON.stringify(profile));
    return profile;
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }

  /**
   * Listen to auth state changes - CUSTOM AUTH (NOOP)
   */
  static onAuthStateChange(_callback: (event: string, session: any) => void) {
    // Custom auth doesn't have real-time state changes
    // Return a dummy unsubscribe function
    return {
      data: { subscription: { unsubscribe: () => {} } }
    };
  }

  /**
   * Register a new user - CUSTOM AUTH
   */
  static async registerUser(userData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: 'admin' | 'subadmin' | 'agent';
    branch_id?: string;
  }) {
    try {
      // Call custom user creation function
      const { data, error } = await supabase.rpc('create_user', {
        user_email: userData.email,
        user_password: userData.password,
        user_full_name: userData.full_name,
        user_phone: userData.phone,
        user_role: userData.role,
        user_branch_id: userData.branch_id || null
      });

      if (error) throw error;

      return { id: data, email: userData.email };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }
}
