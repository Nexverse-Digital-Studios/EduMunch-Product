import { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X, User } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarNavItemProps {
  item: any;
  isActive: boolean;
  isExpanded: boolean;
  onNavigate: (path: string) => void;
  onToggleExpand?: () => void;
  currentPath?: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive,
  isExpanded,
  onNavigate,
  onToggleExpand,
  currentPath = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  
  // Check if any child is active
  const hasActiveChild = hasChildren && item.children.some((child: any) => 
    currentPath.startsWith(child.path || '')
  );

  // Auto-expand if a child is active
  useEffect(() => {
    if (hasActiveChild && isExpanded) {
      setIsOpen(true);
    }
  }, [hasActiveChild, isExpanded]);

  const handleClick = () => {
    if (hasChildren) {
      // If sidebar is collapsed and item has children, expand the sidebar
      if (!isExpanded) {
        onToggleExpand?.();
        setIsOpen(true);
      } else {
        // If sidebar is expanded, toggle the dropdown
        setIsOpen(!isOpen);
      }
    } else if (item.path) {
      // If no children, navigate directly
      onNavigate(item.path);
    }
  };

  const Icon = item.icon;

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center justify-between transition-all duration-200',
          isExpanded
            ? 'px-3 py-2.5 text-sm font-medium rounded-xl'
            : 'p-3 justify-center rounded-lg',
          (isActive || hasActiveChild) && !hasChildren
            ? 'bg-indigo-50 text-indigo-600'
            : hasActiveChild && hasChildren
            ? 'bg-indigo-50 text-indigo-600'
            : isExpanded
            ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        title={!isExpanded ? item.label : undefined}
      >
        <div className={cn('flex items-center', isExpanded && 'gap-3')}>
          <Icon className={cn(
            'flex-shrink-0',
            (isActive || hasActiveChild) ? 'text-indigo-600' : 'text-gray-500'
          )} />
          {isExpanded && <span className="truncate">{item.label}</span>}
        </div>
        {isExpanded && hasChildren && (
          <ChevronDown
            className={cn('w-4 h-4 transition-transform text-gray-400 flex-shrink-0', isOpen && 'rotate-180')}
          />
        )}
      </button>

      {/* Dropdown children - expanded view only */}
      {isExpanded && hasChildren && isOpen && (
        <div className="ml-8 mt-1 space-y-1">
          {item.children.map((child: any) => {
            const isChildActive = currentPath.startsWith(child.path || '');
            return (
              <button
                key={child.id}
                onClick={() => onNavigate(child.path)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                  isChildActive
                    ? 'text-indigo-600 bg-indigo-50 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                )}
              >
                {child.label}
                {child.badge && (
                  <span className="ml-2 inline-block bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    {child.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  navItems: any[];
  currentPath: string;
  onNavigate: (path: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  onToggleExpand,
  navItems,
  currentPath,
  onNavigate,
  isMobileOpen,
  onMobileClose,
  userInfo = { name: 'Super Admin', email: 'admin@edumunch.com' },
}) => {
  const handleNavigate = (path: string) => {
    onNavigate(path);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 md:z-10 transition-all duration-300 flex flex-col',
          isExpanded ? 'w-64' : 'w-20',
          !isMobileOpen && '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo / Header */}
        <div
          className={cn(
            'flex items-center px-4 py-5 border-b border-gray-100',
            isExpanded ? 'justify-between' : 'justify-center'
          )}
        >
          {isExpanded ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">EM</span>
              </div>
              <span className="font-bold text-xl text-gray-800">EduMunch</span>
            </div>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-base">EM</span>
            </div>
          )}
          
          {/* Toggle button - circular with chevron */}
          <button
            onClick={onToggleExpand}
            className={cn(
              'hidden md:flex w-7 h-7 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors',
              !isExpanded && 'absolute -right-3.5 top-7'
            )}
            title="Toggle sidebar"
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation sections - scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {navItems.map((section: any) => (
              <div key={section.section}>
                {isExpanded && (
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.section}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item: any) => (
                    <SidebarNavItem
                      key={item.id}
                      item={item}
                      isActive={currentPath.startsWith(item.path || '')}
                      isExpanded={isExpanded}
                      onNavigate={handleNavigate}
                      onToggleExpand={onToggleExpand}
                      currentPath={currentPath}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User profile section at bottom */}
        <div className={cn(
          'border-t border-gray-100 p-4',
          !isExpanded && 'flex justify-center'
        )}>
          {isExpanded ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt={userInfo.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{userInfo.name}</p>
                <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile toggle button (shown only on mobile when sidebar is closed) */}
      {!isMobileOpen && (
        <button
          onClick={() => { onMobileClose(); onToggleExpand(); }}
          className="md:hidden fixed bottom-6 right-6 bg-indigo-600 text-white p-3.5 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-20"
          title="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  );
};
