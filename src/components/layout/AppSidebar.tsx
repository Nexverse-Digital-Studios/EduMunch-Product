/**
 * App Sidebar - EduMunch (Refactored)
 * ====================================
 * 
 * Dynamic navigation based on:
 * 1. Centralized sidebar configuration (@/routes/sidebarConfig)
 * 2. Feature toggles (from config)
 * 3. User permissions (from PermissionContext)
 * 4. Admin-only routes
 * 
 * This sidebar now uses the centralized route configuration
 * for a single source of truth for all navigation.
 */

import { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  X,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FEATURES, isFeatureEnabled } from "@/config/features.config";
import { usePermissions } from "@/contexts/PermissionContext";
import { useAuth } from "@/contexts/AuthContext";

// Import centralized sidebar configuration
import { sidebarGroups, SidebarGroup, ModuleSidebarConfig, ModuleSubItem } from "@/routes";

// ==========================================
// ICON RESOLVER
// ==========================================

/**
 * Get Lucide icon component by name
 */
const getIcon = (iconName?: string): React.ElementType => {
  if (!iconName) return LayoutDashboard;
  
  // Try to get icon from LucideIcons with proper type casting
  const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[iconName];
  return IconComponent || LayoutDashboard;
};

// ==========================================
// FEATURE FLAG MAPPING
// ==========================================

/**
 * Maps module codes to feature flag keys
 */
const moduleToFeatureMap: Record<string, string> = {
  // Tier 1 modules
  'users': 'users',
  'roles': 'roles',
  'permissions': 'permissions',
  'students': 'students',
  'parents': 'parents',
  'teachers': 'teachers',
  'employees': 'employees',
  'attendance': 'attendance',
  'staff_attendance': 'attendance',
  'leave': 'leaveManagement',
  'staff_leave': 'leaveManagement',
  'academic_years': 'classes',
  'classes': 'classes',
  'sections': 'sections',
  'subjects': 'subjects',
  'topics': 'topics',
  'timetable': 'timetables',
  'lecture_templates': 'lectureTemplates',
  'exams': 'exams',
  'marks': 'results',
  'report_cards': 'reportCards',
  'fees': 'fees',
  'payments': 'payments',
  'notifications': 'notifications',
  'announcements': 'announcements',
  'admissions': 'admissions',
  'id_cards': 'idCards',
  
  // Tier 2 modules
  'assignments': 'assignments',
  'study_materials': 'lmsContent',
  'online_classes': 'lmsContent',
  'homework': 'homework',
  'doubts': 'doubts',
  'transport': 'transport',
  'payroll': 'salaryStructures',
  'salary_structures': 'salaryStructures',
  'payslips': 'payslips',
  'appraisal': 'salaryStructures',
  'recruitment': 'employees',
  'feedback': 'feedback',
  'grievances': 'grievances',
  'support_tickets': 'supportTickets',
  'availability_slots': 'availabilitySlots',
  'working_hours': 'workingHours',
  
  // Tier 3 modules
  'analytics': 'reports',
  'ptm_requests': 'ptmRequests',
  'alumni': 'students',
  'inventory': 'inventory',
  'certificates': 'students',
  'surveys': 'feedback',
  'branches': 'branches',
  'tie_up_schools': 'tieUpSchools',
  'library': 'library',
  'hostel': 'hostel',
  'reports': 'reports',
};

/**
 * Check if a module's feature is enabled
 */
const isModuleFeatureEnabled = (moduleCode?: string): boolean => {
  if (!moduleCode) return true;
  const featureKey = moduleToFeatureMap[moduleCode];
  if (!featureKey) return true; // If no mapping, assume enabled
  return isFeatureEnabled(featureKey as keyof typeof FEATURES);
};

// ==========================================
// NAV ITEM INTERFACE
// ==========================================

interface NavItemConfig {
  to?: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  children?: NavItemConfig[];
  isActive?: boolean;
  onNavigate?: () => void;
  moduleCode?: string;             // Permission module code
  adminOnly?: boolean;             // Requires admin role
}

// ==========================================
// NAV ITEM COMPONENT
// ==========================================

const NavItem = ({ to, icon: Icon, label, isCollapsed, children, isActive, onNavigate }: NavItemConfig) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const hasChildren = children && children.length > 0;
  const isChildActive = hasChildren && children.some(child => child.to === location.pathname);
  const itemIsActive = isActive || (to && location.pathname === to) || isChildActive;

  // Auto-expand if a child is active
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-all",
            itemIsActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </>
          )}
        </button>
        {!isCollapsed && isOpen && (
          <div className="ml-4 space-y-1 border-l border-sidebar-border pl-4">
            {children.map((child) => (
              <NavItem key={child.to} {...child} isCollapsed={isCollapsed} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to || "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-all",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );
};

// ==========================================
// SIDEBAR CONFIGURATION FROM CENTRALIZED CONFIG
// ==========================================

/**
 * Convert ModuleSubItem to NavItemConfig
 */
const convertSubItem = (item: ModuleSubItem, moduleCode: string): NavItemConfig => ({
  to: item.path,
  icon: getIcon(item.icon),
  label: item.title,
  isCollapsed: false,
  moduleCode,
});

/**
 * Convert ModuleSidebarConfig to NavItemConfig (for children within a group)
 */
const convertModuleConfig = (config: ModuleSidebarConfig): NavItemConfig => {
  const hasSubItems = config.subItems && config.subItems.length > 0;
  
  return {
    to: hasSubItems ? undefined : config.basePath,
    icon: getIcon(config.icon),
    label: config.displayName,
    isCollapsed: false,
    moduleCode: config.moduleCode,
    children: hasSubItems 
      ? config.subItems!.map(item => convertSubItem(item, config.moduleCode))
      : undefined,
  };
};

/**
 * Convert SidebarGroup to NavItemConfig
 */
const convertSidebarGroup = (group: SidebarGroup): NavItemConfig => ({
  icon: getIcon(group.icon),
  label: group.groupName,
  isCollapsed: false,
  children: group.modules.map(convertModuleConfig),
});

/**
 * Generate navigation items from centralized sidebarGroups
 */
const generateNavigationItems = (): NavItemConfig[] => {
  // Dashboard is always first
  const dashboardItem: NavItemConfig = {
    to: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
    isCollapsed: false,
  };
  
  // Convert sidebar groups
  const groupItems = sidebarGroups.map(convertSidebarGroup);
  
  // Profile is always last
  const profileItem: NavItemConfig = {
    to: "/profile",
    icon: User,
    label: "Profile",
    isCollapsed: false,
  };
  
  return [dashboardItem, ...groupItems, profileItem];
};

// ==========================================
// PROPS INTERFACE
// ==========================================

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

// ==========================================
// FILTERED NAVIGATION HOOK
// ==========================================

/**
 * Filter navigation items based on features and permissions
 * Uses the centralized sidebarGroups configuration
 */
const useFilteredNavigation = () => {
  const { hasModuleAccess, isAdmin, permissions } = usePermissions();
  const { userProfile } = useAuth();
  
  return useMemo(() => {
    console.log('[AppSidebar] Filtering navigation items from centralized config:', {
      isAdmin: isAdmin(),
      userId: userProfile?.id,
      hasPermissions: !!permissions,
      sidebarGroupsCount: sidebarGroups.length,
    });

    // Generate navigation items from centralized config
    const navigationItems = generateNavigationItems();

    const filterItems = (items: NavItemConfig[]): NavItemConfig[] => {
      return items
        .filter(item => {
          // Check admin-only
          if (item.adminOnly && !isAdmin()) {
            console.log(`[AppSidebar] Filtering out admin-only item: ${item.label}`);
            return false;
          }
          
          // Check feature toggle for module
          if (item.moduleCode && !isModuleFeatureEnabled(item.moduleCode)) {
            console.log(`[AppSidebar] Filtering out disabled feature: ${item.label} (${item.moduleCode})`);
            return false;
          }
          
          // If has children, check if any children are visible
          if (item.children) {
            const visibleChildren = filterItems(item.children);
            if (visibleChildren.length === 0) {
              console.log(`[AppSidebar] Filtering out parent with no visible children: ${item.label}`);
            }
            return visibleChildren.length > 0;
          }
          
          // Check module permission (Admin bypasses this)
          if (item.moduleCode && !isAdmin()) {
            const hasAccess = hasModuleAccess(item.moduleCode);
            console.log(`[AppSidebar] Module permission check: ${item.label} (${item.moduleCode}) = ${hasAccess}`);
            return hasAccess;
          }

          return true;
        })
        .map(item => {
          if (item.children) {
            return {
              ...item,
              children: filterItems(item.children),
            };
          }
          return item;
        });
    };
    
    const filtered = filterItems(navigationItems);
    console.log('[AppSidebar] Final visible items count:', filtered.length);
    return filtered;
  }, [hasModuleAccess, isAdmin, userProfile, permissions]);
};

// ==========================================
// MAIN SIDEBAR COMPONENT
// ==========================================

export const AppSidebar = ({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: AppSidebarProps) => {
  const filteredNavItems = useFilteredNavigation();
  const { userProfile } = useAuth();
  const { permissions, isLoading } = usePermissions();
  
  console.log('[AppSidebar] Render state:', {
    hasPermissions: !!permissions,
    isLoading,
    visibleItemsCount: filteredNavItems.length,
  });
  
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          // Desktop
          "lg:z-40",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          // Mobile
          "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">EduMunch</span>
            </div>
          )}
          
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-sidebar-border hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={onToggle}
            className="hidden h-8 w-8 items-center justify-center rounded-lg border border-sidebar-border hover:bg-sidebar-accent lg:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          {isLoading && !permissions ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <div className="animate-spin">
                <Settings className="h-6 w-6 text-muted-foreground" />
              </div>
              {!isCollapsed && (
                <p className="text-sm text-muted-foreground">Loading menu...</p>
              )}
            </div>
          ) : (
            <nav className="space-y-1">
              {filteredNavItems.map((item, index) => (
                <NavItem
                  key={item.to || item.label + index}
                  {...item}
                  isCollapsed={isCollapsed && !isMobileOpen}
                  onNavigate={onMobileClose}
                />
              ))}
            </nav>
          )}
        </ScrollArea>

        {/* User Profile */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-sidebar-border bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-base font-medium text-foreground">
                  {userProfile?.full_name || 'User'}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {userProfile?.primary_role?.role_name || userProfile?.email || ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
