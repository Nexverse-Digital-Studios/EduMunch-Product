import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  role?: string;
  orgId?: string;
  branchId?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
  session?: Session;
}

class AuthService {
  /**
   * Sign up a new user
   */
  async signup(
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: data.user ? this.mapAuthUser(data.user) : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      return { success: false, error: message };
    }
  }

  /**
   * Sign in with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Fetch user profile from database
      const userProfile = await this.getUserProfile(data.user?.id);

      return {
        success: true,
        user: userProfile || this.mapAuthUser(data.user),
        session: data.session || undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: message };
    }
  }

  /**
   * Sign out the current user
   */
  async logout(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      return { success: false, error: message };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      // Fetch user profile from database
      const userProfile = await this.getUserProfile(user.id);
      return userProfile || this.mapAuthUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user profile from database
   */
  async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          id,
          email,
          display_name,
          org_id,
          branch_id,
          roles(name)
        `
        )
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        orgId: data.org_id,
        branchId: data.branch_id,
        role: Array.isArray(data.roles) && data.roles.length > 0 ? (data.roles[0] as any)?.name : (data.roles as any)?.name,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Password reset failed';
      return { success: false, error: message };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Password update failed';
      return { success: false, error: message };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userProfile = await this.getUserProfile(session.user.id);
        callback(userProfile || this.mapAuthUser(session.user));
      } else {
        callback(null);
      }
    });

    return subscription;
  }

  /**
   * Map Supabase auth user to our AuthUser interface
   */
  private mapAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.display_name || user.email,
    };
  }
}

export const authService = new AuthService();
