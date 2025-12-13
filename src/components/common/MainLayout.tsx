import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '../../utils/cn';

interface MainLayoutProps {
  children: React.ReactNode;
  navItems: any[];
  onNavigate: (path: string) => void;
  onLogout: () => void;
  userRole: string;
  userName: string;
  userEmail?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  navItems,
  onNavigate,
  onLogout,
  userRole,
  userName,
  userEmail = 'admin@edumunch.com',
}) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleNavigate = (path: string) => {
    onNavigate(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
        navItems={navItems}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        userInfo={{
          name: userName,
          email: userEmail,
        }}
      />

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarExpanded ? 'md:ml-64' : 'md:ml-20'
        )}
      >
        {/* Navbar */}
        <Navbar
          title=""
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
          sidebarExpanded={sidebarExpanded}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-20 pb-6">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
