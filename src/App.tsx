import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { MainLayout } from './components/common/MainLayout';
import { navigationConfig } from './constants/navigation';
import { useAuthStore } from './store/authStore';

type UserRole = 'admin' | 'student' | 'teacher' | 'parent';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, initializeAuth, isLoading } = useAuthStore();
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [userName, setUserName] = useState('Super Admin');

  // Initialize auth on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Update user info when auth state changes
  useEffect(() => {
    if (user) {
      setUserName(user.displayName || user.email);
      // Determine role based on user's role or route
      const pathRole = location.pathname.split('/')[1] as UserRole;
      if (['admin', 'student', 'teacher', 'parent'].includes(pathRole)) {
        setUserRole(pathRole);
      }
    }
  }, [user, location.pathname]);

  // Change role for demo purposes (can be removed later)
  useEffect(() => {
    const pathRole = location.pathname.split('/')[1] as UserRole;
    if (['admin', 'student', 'teacher', 'parent'].includes(pathRole)) {
      setUserRole(pathRole);
      // Don't override userName if user is authenticated
      if (!user) {
        const roleNames: Record<UserRole, string> = {
          admin: 'Super Admin',
          student: 'Student',
          teacher: 'Teacher',
          parent: 'Parent',
        };
        setUserName(roleNames[pathRole]);
      }
    }
  }, [location.pathname, user]);

  // Get navigation items based on user role
  const getNavItems = () => {
    return navigationConfig[userRole] || navigationConfig.admin;
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Show loading state without early return to maintain hook order
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-indigo-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      navItems={getNavItems()}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userRole={userRole}
      userName={userName}
    >
      <Outlet />
    </MainLayout>
  );
}

export default App;
