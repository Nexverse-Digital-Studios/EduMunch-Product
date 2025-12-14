import { useState } from 'react';
import { Bell, User, LogOut, Settings, Search, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  title?: string;
  userName: string;
  userRole: string;
  onLogout: () => void;
  sidebarExpanded: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  userRole,
  onLogout,
  sidebarExpanded,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav
      className={cn(
        'fixed top-0 right-0 h-16 bg-white dark:bg-dark-surface-primary border-b border-gray-200 dark:border-dark-border-primary z-20 transition-all duration-300 flex items-center justify-between px-6',
        sidebarExpanded ? 'left-64' : 'left-20 md:left-20'
      )}
    >
      {/* Left side - Search bar */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-text-secondary" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 lg:w-80 pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-dark-bg-primary border border-gray-200 dark:border-dark-border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-dark-text-primary transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Notifications */}
        <button
          className="relative p-2.5 text-gray-500 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-surface-secondary rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-bg-secondary"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-dark-border-primary"
          >
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-medium text-gray-800 dark:text-dark-text-primary">{userName}</p>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary capitalize">{userRole}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-surface-primary border border-gray-200 dark:border-dark-border-primary rounded-xl shadow-lg py-1 z-50">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-surface-secondary transition-colors">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-surface-secondary transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <hr className="my-1 border-gray-100 dark:border-dark-border-secondary" />
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
