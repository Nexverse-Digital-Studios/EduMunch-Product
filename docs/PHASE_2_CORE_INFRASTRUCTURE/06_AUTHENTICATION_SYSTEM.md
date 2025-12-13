# Authentication System

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

The authentication system is the foundation of EduMunch. It handles:
- User login/registration
- Session management
- Two-Factor Authentication (2FA)
- JWT token handling
- Password reset workflows
- Account security

---

## Architecture

### Component Flow

```
┌─ User Authentication Flow
│
├─ Login Page
│  ├─ Email/Password Input
│  ├─ Form Validation (Zod)
│  └─ useAuthLogin Hook
│
├─ Supabase Auth Service
│  ├─ Email/Password Verification
│  ├─ Session Creation
│  └─ JWT Token Generation
│
├─ User Profile Lookup
│  ├─ Fetch from users table
│  ├─ Load role/permissions
│  └─ Load organization context
│
├─ Zustand Store
│  ├─ Store user info
│  ├─ Store auth token
│  └─ Store permissions
│
└─ Protected Routes
   ├─ Check auth status
   └─ Redirect if not authenticated
```

---

## Database Schema

### Core Auth Tables

#### 1. Users Table (Profile Data - NOT auth metadata)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,                              -- Links to auth.users(id)
  org_id UUID NOT NULL,                             -- Organization reference
  branch_id UUID,                                   -- Branch reference (nullable)
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(255) GENERATED ALWAYS AS 
    (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
  phone VARCHAR(20),
  avatar_url TEXT,                                  -- Profile picture URL
  avatar_bucket_path VARCHAR(255),                  -- Storage path for updates
  role_id UUID,                                     -- Custom role assignment
  primary_role VARCHAR(50),                         -- Predefined role (teacher, student, etc)
  status VARCHAR(20) DEFAULT 'active',              -- active, inactive, suspended, invited
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45),                        -- IPv4 or IPv6
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,                           -- Account lockout time
  password_changed_at TIMESTAMP,
  notification_preferences JSONB DEFAULT '{}',     -- Email/SMS preferences
  metadata JSONB DEFAULT '{}',                      -- Custom org-specific data
  created_by UUID,                                  -- Who created this user
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,                             -- Soft delete
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_role FOREIGN KEY (role_id) 
    REFERENCES roles(id) ON DELETE SET NULL,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_branch_id ON users(branch_id);

-- RLS Policy: Users can only see users from their organization
CREATE POLICY "org_isolation" ON users
  USING (org_id = (
    SELECT org_id FROM users WHERE id = auth.uid()
  ))
  WITH CHECK (org_id = (
    SELECT org_id FROM users WHERE id = auth.uid()
  ));
```

#### 2. Sessions Table

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  token VARCHAR(500),                               -- JWT token (optional, for reference)
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),                          -- Browser/app info
  device_type VARCHAR(50),                          -- desktop, mobile, tablet
  device_os VARCHAR(100),                           -- Windows, iOS, Android, etc
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_org_id ON sessions(org_id);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

-- RLS Policy
CREATE POLICY "user_sessions" ON sessions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

#### 3. Two-Factor Authentication (2FA) Table

```sql
CREATE TABLE two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,                     -- One 2FA per user
  org_id UUID NOT NULL,
  method VARCHAR(50),                               -- 'totp', 'sms', 'email'
  secret VARCHAR(255),                              -- Encrypted TOTP secret
  backup_codes TEXT[],                              -- Backup codes (encrypted)
  enabled_at TIMESTAMP,
  verified_at TIMESTAMP,
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- RLS Policy
CREATE POLICY "own_2fa" ON two_factor_auth
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

#### 4. Password Reset Tokens

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,               -- Random token
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_pwd_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_pwd_reset_user_id ON password_reset_tokens(user_id);
```

#### 5. Login Audit Table

```sql
CREATE TABLE login_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                                     -- NULL for failed login attempts
  org_id UUID,
  email VARCHAR(255),
  event_type VARCHAR(50),                           -- 'login_success', 'login_failed', 'logout'
  reason VARCHAR(255),                              -- For failed attempts
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes for audit queries
CREATE INDEX idx_login_audit_user_id ON login_audit(user_id);
CREATE INDEX idx_login_audit_org_id ON login_audit(org_id);
CREATE INDEX idx_login_audit_created_at ON login_audit(created_at);
```

---

## Implementation Files

### 1. Auth Store (src/store/auth.store.ts)

```typescript
import { create } from 'zustand';
import { User } from '@/types/auth.types';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Call API service
      const { user, token } = await authService.login(email, password);
      set({ user, token, isAuthenticated: true });
      // Store token in localStorage
      localStorage.setItem('auth_token', token);
    } catch (error) {
      set({ error: error.message, isAuthenticated: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  register: async (email, password, firstName, lastName) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register(
        email,
        password,
        firstName,
        lastName
      );
      set({ user, token, isAuthenticated: true });
      localStorage.setItem('auth_token', token);
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('auth_token');
  },
  
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  clearError: () => set({ error: null }),
}));
```

### 2. Auth Service (src/services/auth.service.ts)

```typescript
import { createClient } from '@supabase/supabase-js';
import { User, LoginRequest, LoginResponse } from '@/types/auth.types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Step 1: Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw new Error(error.message);
    
    const token = data.session?.access_token!;
    
    // Step 2: Fetch user profile from our database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user!.id)
      .single();
    
    if (profileError) throw new Error('User profile not found');
    
    // Step 3: Log the login
    await supabase.from('login_audit').insert({
      user_id: profile.id,
      org_id: profile.org_id,
      email,
      event_type: 'login_success',
      ip_address: await this.getClientIP(),
    });
    
    // Step 4: Update last login
    await supabase
      .from('users')
      .update({
        last_login_at: new Date(),
        login_count: profile.login_count + 1,
      })
      .eq('id', profile.id);
    
    return {
      user: profile as User,
      token,
      expiresIn: data.session?.expires_in || 3600,
    };
  },
  
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<LoginResponse> {
    // Step 1: Create auth user in Supabase
    const { data: authData, error: authError } = 
      await supabase.auth.signUp({
        email,
        password,
      });
    
    if (authError) throw new Error(authError.message);
    
    const userId = authData.user!.id;
    
    // Step 2: Create user profile (to be assigned to org later)
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        status: 'active',
        // org_id will be set when organization is created
      })
      .select()
      .single();
    
    if (profileError) throw new Error('Failed to create user profile');
    
    // Step 3: Re-authenticate to get token
    const { data: sessionData, error: sessionError } = 
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
    
    if (sessionError) throw new Error(sessionError.message);
    
    return {
      user: profileData as User,
      token: sessionData.session!.access_token,
      expiresIn: sessionData.session!.expires_in || 3600,
    };
  },
  
  async logout(userId: string): Promise<void> {
    // Log the logout
    await supabase.from('login_audit').insert({
      user_id: userId,
      event_type: 'logout',
    });
    
    // Sign out from Supabase
    await supabase.auth.signOut();
  },
  
  async forgotPassword(email: string): Promise<void> {
    // Step 1: Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, org_id')
      .eq('email', email)
      .single();
    
    if (userError) throw new Error('User not found');
    
    // Step 2: Generate reset token
    const resetToken = Math.random().toString(36).substring(2) + 
                      Date.now().toString(36);
    
    // Step 3: Save token to database
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
    
    await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      org_id: user.org_id,
      token: resetToken,
      expires_at: expiresAt,
    });
    
    // Step 4: Send email with reset link
    const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
    await emailService.sendPasswordReset(email, resetLink);
  },
  
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Step 1: Validate token
    const { data: resetRecord, error } = await supabase
      .from('password_reset_tokens')
      .select('user_id, expires_at, used_at')
      .eq('token', token)
      .single();
    
    if (error || !resetRecord) throw new Error('Invalid reset token');
    if (resetRecord.used_at) throw new Error('Token already used');
    if (new Date(resetRecord.expires_at) < new Date()) {
      throw new Error('Token expired');
    }
    
    // Step 2: Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (updateError) throw new Error(updateError.message);
    
    // Step 3: Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date() })
      .eq('token', token);
    
    // Step 4: Update password_changed_at in user profile
    await supabase
      .from('users')
      .update({ password_changed_at: new Date() })
      .eq('id', resetRecord.user_id);
  },
  
  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  },
};
```

### 3. Auth Hook (src/hooks/auth/useAuthLogin.ts)

```typescript
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export function useAuthLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore(state => state.setUser);
  const setToken = useAuthStore(state => state.setToken);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user, token } = await authService.login(email, password);
      setUser(user);
      setToken(token);
      localStorage.setItem('auth_token', token);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { login, isLoading, error };
}
```

### 4. Login Component (src/components/auth/LoginForm.tsx)

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuthLogin } from '@/hooks/auth/useAuthLogin';
import { LoginRequest, loginSchema } from '@/types/auth.types';
import { Button } from '@/components/common/buttons/Button';
import { FormInput } from '@/components/common/forms/FormInput';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginRequest) => {
    try {
      const user = await login(data.email, data.password);
      // Redirect to dashboard
      navigate(`/${user.primary_role}-portal/dashboard`);
    } catch (err) {
      // Error is handled by hook
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Login to EduMunch</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <FormInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        {...register('email')}
        error={errors.email?.message}
      />
      
      <FormInput
        label="Password"
        type="password"
        placeholder="••••••••"
        {...register('password')}
        error={errors.password?.message}
      />
      
      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
      >
        Login
      </Button>
      
      <div className="text-center text-sm">
        <a href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>
    </form>
  );
};
```

### 5. Protected Route Component (src/components/common/ProtectedRoute.tsx)

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.primary_role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

---

## Authentication Types (src/types/auth.types.ts)

```typescript
export interface User {
  id: string;
  org_id: string;
  branch_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role_id?: string;
  primary_role: 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'employee' | string;
  status: 'active' | 'inactive' | 'suspended' | 'invited';
  email_verified_at?: string;
  last_login_at?: string;
  login_count: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  phone: z.string().optional(),
});
```

---

## Routes Setup (App.tsx)

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LoginForm } from '@/components/auth/LoginForm';
import { StudentPortal } from '@/pages/student-portal/Dashboard';
import { TeacherPortal } from '@/pages/teacher-portal/Dashboard';
import { AdminPortal } from '@/pages/admin-portal/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Protected Routes */}
        <Route
          path="/student-portal/*"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-portal/*"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-portal/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPortal />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Session Management

### Keep-Alive (src/hooks/useSessionKeepAlive.ts)

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/services/api/client';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useSessionKeepAlive() {
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      try {
        // Refresh token by calling a protected endpoint
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Session expired, redirect to login
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Session keep-alive failed:', error);
      }
    }, KEEP_ALIVE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [user]);
}
```

---

## Security Best Practices

### Do's
- ✅ Store JWT in secure, HTTP-only cookie (for sensitive apps)
- ✅ Validate token expiry
- ✅ Use HTTPS in production
- ✅ Hash passwords on backend
- ✅ Rate limit login attempts
- ✅ Implement account lockout after failed attempts
- ✅ Log all authentication events

### Don'ts
- ❌ Store passwords in plaintext
- ❌ Store JWT in localStorage (XSS vulnerable)
- ❌ Send auth token in URL
- ❌ Ignore CORS for auth endpoints
- ❌ Allow weak passwords
- ❌ Skip email verification

---

## Testing

### Login Test (src/components/auth/__tests__/LoginForm.test.ts)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { useAuthLogin } from '@/hooks/auth/useAuthLogin';
import { BrowserRouter } from 'react-router-dom';

jest.mock('@/hooks/auth/useAuthLogin');

test('Login form submits with valid credentials', async () => {
  const mockLogin = jest.fn();
  (useAuthLogin as jest.Mock).mockReturnValue({
    login: mockLogin,
    isLoading: false,
    error: null,
  });
  
  render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );
  
  fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
    target: { value: 'test@example.com' },
  });
  
  fireEvent.change(screen.getByPlaceholderText('••••••••'), {
    target: { value: 'password123' },
  });
  
  fireEvent.click(screen.getByText('Login'));
  
  expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
});
```

---

## Next Steps

1. ✅ Create users table with all fields
2. ✅ Create sessions table for tracking
3. ✅ Implement login/register services
4. ✅ Create authentication components
5. ✅ Set up protected routes
6. ✅ Proceed to `07_USER_PROFILES.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Authentication System Complete  
**Next Phase:** 07_USER_PROFILES.md
