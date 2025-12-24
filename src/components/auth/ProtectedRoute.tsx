/**
 * Protected Route Component - EduMunch
 * =====================================
 * 
 * Three levels of protection:
 * 1. Authentication check (must be logged in)
 * 2. Feature check (feature must be enabled in config)
 * 3. Permission check (user must have required permission)
 * 
 * Usage:
 * - Basic auth only: <ProtectedRoute>{children}</ProtectedRoute>
 * - With module: <ProtectedRoute requiredModule="users">{children}</ProtectedRoute>
 * - With action: <ProtectedRoute requiredModule="users" requiredAction="create">{children}</ProtectedRoute>
 * - Admin only: <ProtectedRoute adminOnly>{children}</ProtectedRoute>
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionContext';
import { isFeatureEnabled, FeatureConfig } from '@/config/features.config';
import { Loader2, ShieldX, Lock } from 'lucide-react';
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
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredModule,
  requiredAction = 'view',
  requiredFeature,
  adminOnly = false,
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, isAdmin, isLoading: permLoading } = usePermissions();
  const location = useLocation();

  // Show loading state
  if (authLoading || permLoading) {
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
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check admin-only routes
  if (adminOnly && !isAdmin()) {
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

  // Check feature toggle
  if (requiredFeature && !isFeatureEnabled(requiredFeature)) {
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
