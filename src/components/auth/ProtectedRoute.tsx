/**
 * Protected Route Component - EduMunch
 * =====================================
 * 
 * Four levels of protection:
 * 1. Authentication check (must be logged in)
 * 2. Role check (user must have one of the required roles)
 * 3. Feature check (feature must be enabled in config)
 * 4. Permission check (user must have required permission)
 * 
 * Usage:
 * - Basic auth only: <ProtectedRoute>{children}</ProtectedRoute>
 * - With module: <ProtectedRoute requiredModule="users">{children}</ProtectedRoute>
 * - With action: <ProtectedRoute requiredModule="users" requiredAction="create">{children}</ProtectedRoute>
 * - Admin only: <ProtectedRoute adminOnly>{children}</ProtectedRoute>
 * - Role restricted: <ProtectedRoute requiredRoles={['parent', 'teacher']}>{children}</ProtectedRoute>
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionContext';
import { isFeatureEnabled, FeatureConfig } from '@/config/features.config';
import { Loader2, ShieldX, Lock, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  
  // Module-based permission check
  requiredModule?: string;
  requiredAction?: 'view' | 'create' | 'update' | 'delete' | 'approve' | 'export';
  
  // Feature toggle check
  requiredFeature?: keyof FeatureConfig;
  
  // Admin-only route
  adminOnly?: boolean;
  
  // Role-based restriction (user must have one of these roles)
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredModule,
  requiredAction = 'view',
  requiredFeature,
  adminOnly = false,
  requiredRoles,
}) => {
  const { user, loading: authLoading, permissions, userProfile } = useAuth();
  const { hasPermission, isAdmin, isLoading: permLoading } = usePermissions();
  const location = useLocation();
  
  // Get user's current role code
  const userRoleCode = permissions?.primaryRole?.code || userProfile?.primary_role?.role_code;

  console.log('[ProtectedRoute] Evaluating route:', {
    path: location.pathname,
    authLoading,
    permLoading,
    user: user?.id,
    requiredModule,
    adminOnly,
    requiredRoles,
    userRoleCode,
  });

  // Show loading state
  if (authLoading || permLoading) {
    console.log('[ProtectedRoute] Still loading:', { authLoading, permLoading });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check admin-only routes
  if (adminOnly && !isAdmin()) {
    console.log('[ProtectedRoute] Admin required but user is not admin');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-8">
          <div className="rounded-full bg-destructive/10 p-4">
            <Lock className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Access Required</h1>
          <p className="text-muted-foreground">
            This page is restricted to administrators only. Please contact your system administrator if you need access.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Check role-based restriction
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = userRoleCode && 
      requiredRoles.some(role => role.toLowerCase() === userRoleCode.toLowerCase());
    
    if (!hasRequiredRole) {
      console.log('[ProtectedRoute] Role restriction failed:', { requiredRoles, userRoleCode });
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 text-center max-w-md p-8">
            <div className="rounded-full bg-destructive/10 p-4">
              <UserX className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
            <p className="text-muted-foreground">
              This page is only accessible to specific roles. Your current role does not have access to this page.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      );
    }
  }

  // Check feature toggle
  if (requiredFeature && !isFeatureEnabled(requiredFeature)) {
    console.log('[ProtectedRoute] Feature not enabled:', requiredFeature);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-8">
          <div className="rounded-full bg-muted p-4">
            <ShieldX className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Feature Not Available</h1>
          <p className="text-muted-foreground">
            This feature is not enabled in your current plan. Please upgrade or contact support for access.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Check module permission
  if (requiredModule && !hasPermission(requiredModule, requiredAction)) {
    console.log('[ProtectedRoute] Permission denied:', { requiredModule, requiredAction });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-8">
          <div className="rounded-full bg-destructive/10 p-4">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to {requiredAction} {requiredModule}. 
            Please contact your administrator to request access.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  console.log('[ProtectedRoute] Access allowed for route:', location.pathname);
  return <>{children}</>;
};

/**
 * Wrapper for routes that should only render if feature is enabled
 * Used in route definitions to prevent route registration entirely
 */
export const FeatureRoute: React.FC<{
  feature: keyof FeatureConfig;
  children: React.ReactNode;
}> = ({ feature, children }) => {
  if (!isFeatureEnabled(feature)) {
    return null;
  }
  return <>{children}</>;
};
