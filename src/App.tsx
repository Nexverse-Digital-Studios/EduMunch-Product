import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { MainLayout } from './components/common/MainLayout';
import { navigationConfig } from './constants/navigation';

type UserRole = 'admin' | 'student' | 'teacher' | 'parent';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [userName, setUserName] = useState('Super Admin');

  // Get navigation items based on user role
  const getNavItems = () => {
    return navigationConfig[userRole] || navigationConfig.admin;
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked');
  };

  // Change role for demo purposes (can be removed later)
  useEffect(() => {
    const pathRole = location.pathname.split('/')[1] as UserRole;
    if (['admin', 'student', 'teacher', 'parent'].includes(pathRole)) {
      setUserRole(pathRole);
      const roleNames: Record<UserRole, string> = {
        admin: 'Super Admin',
        student: 'Student',
        teacher: 'Teacher',
        parent: 'Parent',
      };
      setUserName(roleNames[pathRole]);
    }
  }, [location.pathname]);

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
