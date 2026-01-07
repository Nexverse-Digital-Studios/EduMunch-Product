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
import { useSidebarConfig } from "@/contexts/SidebarConfigContext";
import { SidebarDisplayStyle, SYSTEM_ROUTES } from "@/types/sidebarConfig";

// Import centralized sidebar configuration
import {
  sidebarGroups,
  SidebarGroup,
  ModuleSidebarConfig,
  ModuleSubItem,
} from "@/routes";

// ==========================================
// ICON RESOLVER
// ==========================================

/**
 * Get Lucide icon component by name
 */
const getIcon = (iconName?: string): React.ElementType => {
  if (!iconName) return LayoutDashboard;

  // Try to get icon from LucideIcons with proper type casting
  const IconComponent = (
    LucideIcons as unknown as Record<string, React.ElementType>
  )[iconName];
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
  users: "users",
  roles: "roles",
  permissions: "permissions",
  students: "students",
  parents: "parents",
  teachers: "teachers",
  employees: "employees",
  attendance: "attendance",
  staff_attendance: "attendance",
  leave: "leaveManagement",
  staff_leave: "leaveManagement",
  academic_years: "classes",
  classes: "classes",
  sections: "sections",
  subjects: "subjects",
  topics: "topics",
  timetable: "timetables",
  lecture_templates: "lectureTemplates",
  exams: "exams",
  marks: "results",
  report_cards: "reportCards",
  fees: "fees",
  payments: "payments",
  notifications: "notifications",
  announcements: "announcements",
  admissions: "admissions",
  id_cards: "idCards",

  // Tier 2 modules
  assignments: "assignments",
  study_materials: "lmsContent",
  online_classes: "lmsContent",
  homework: "homework",
  doubts: "doubts",
  transport: "transport",
  payroll: "salaryStructures",
  salary_structures: "salaryStructures",
  payslips: "payslips",
  appraisal: "salaryStructures",
  recruitment: "employees",
  feedback: "feedback",
  grievances: "grievances",
  support_tickets: "supportTickets",
  availability_slots: "availabilitySlots",
  working_hours: "workingHours",

  // Tier 3 modules
  analytics: "reports",
  ptm_requests: "ptmRequests",
  alumni: "students",
  inventory: "inventory",
  certificates: "students",
  surveys: "feedback",
  branches: "branches",
  tie_up_schools: "tieUpSchools",
  library: "library",
  hostel: "hostel",
  reports: "reports",
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
  moduleCode?: string; // Permission module code
  adminOnly?: boolean; // Requires admin role
}

// ==========================================
// NAV ITEM COMPONENT (Dropdown Style)
// ==========================================

const NavItem = ({
  to,
  icon: Icon,
  label,
  isCollapsed,
  children,
  isActive,
  onNavigate,
}: NavItemConfig) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const hasChildren = children && children.length > 0;
  const isChildActive =
    hasChildren && children.some((child) => child.to === location.pathname);
  const itemIsActive =
    isActive || (to && location.pathname === to) || isChildActive;

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
              <NavItem
                key={child.to}
                {...child}
                isCollapsed={isCollapsed}
                onNavigate={onNavigate}
              />
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
// SECTION NAV ITEM (Sections Style - Flat with accent headers)
// ==========================================

interface SectionNavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

const SectionNavItem = ({
  to,
  icon: Icon,
  label,
  isCollapsed,
  onNavigate,
}: SectionNavItemProps) => {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );
};

interface SectionGroupProps {
  title: string;
  children: React.ReactNode;
  isCollapsed: boolean;
}

const SectionGroup = ({ title, children, isCollapsed }: SectionGroupProps) => {
  if (isCollapsed) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <div className="space-y-2">
      <div className="px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {title}
        </span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

// ==========================================
// SIDEBAR CONFIGURATION FROM CENTRALIZED CONFIG
// ==========================================

/**
 * Convert ModuleSubItem to NavItemConfig
 */
const convertSubItem = (
  item: ModuleSubItem,
  moduleCode: string
): NavItemConfig => ({
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
      ? config.subItems!.map((item) => convertSubItem(item, config.moduleCode))
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

  // Note: Analytics was removed as a standalone item to avoid duplicate key warnings
  // If analytics is needed, add analyticsModule to a sidebarGroup in sidebarConfig.ts
  return [dashboardItem, ...groupItems];
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
 * Filter navigation items based on features, permissions, and user sidebar config
 * Uses the centralized sidebarGroups configuration
 */
const useFilteredNavigation = (isRouteVisible: (path: string) => boolean) => {
  const { hasModuleAccess, isAdmin, permissions } = usePermissions();
  const { userProfile } = useAuth();

  return useMemo(() => {
    console.log(
      "[AppSidebar] Filtering navigation items from centralized config:",
      {
        isAdmin: isAdmin(),
        userId: userProfile?.id,
        hasPermissions: !!permissions,
        sidebarGroupsCount: sidebarGroups.length,
      }
    );

    // Generate navigation items from centralized config
    const navigationItems = generateNavigationItems();

    const filterItems = (items: NavItemConfig[]): NavItemConfig[] => {
      return items
        .filter((item) => {
          // Check admin-only
          if (item.adminOnly && !isAdmin()) {
            return false;
          }

          // Check feature toggle for module
          if (item.moduleCode && !isModuleFeatureEnabled(item.moduleCode)) {
            return false;
          }

          // Check user visibility preferences (for routes with paths)
          if (
            item.to &&
            !SYSTEM_ROUTES.includes(item.to) &&
            !isRouteVisible(item.to)
          ) {
            return false;
          }

          // If has children, check if any children are visible
          if (item.children) {
            const visibleChildren = filterItems(item.children);
            if (visibleChildren.length === 0) {
              return false;
            }
            return true;
          }

          // Check module permission (Admin bypasses this)
          if (item.moduleCode && !isAdmin()) {
            const hasAccess = hasModuleAccess(item.moduleCode);
            return hasAccess;
          }

          return true;
        })
        .map((item) => {
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
    console.log("[AppSidebar] Final visible items count:", filtered.length);
    return filtered;
  }, [hasModuleAccess, isAdmin, userProfile, permissions, isRouteVisible]);
};

// ==========================================
// SECTIONS LAYOUT RENDERER
// ==========================================

interface SectionsLayoutProps {
  items: NavItemConfig[];
  isCollapsed: boolean;
  onNavigate?: () => void;
}

const SectionsLayout = ({
  items,
  isCollapsed,
  onNavigate,
}: SectionsLayoutProps) => {
  // Group items: first item is Dashboard (HOME section),
  // middle items are groups (their own sections),
  // last item is Profile (part of the last group or separate)

  const sections: { title: string; items: NavItemConfig[] }[] = [];

  items.forEach((item) => {
    if (item.to === "/" || item.to === "/dashboard") {
      // Dashboard goes in HOME section
      sections.push({
        title: "HOME",
        items: [item],
      });
    } else if (item.to === "/profile") {
      // Profile goes at the end
      // Add to last section or create new
      if (sections.length > 0) {
        sections[sections.length - 1].items.push(item);
      } else {
        sections.push({
          title: "PROFILE",
          items: [item],
        });
      }
    } else if (item.children && item.children.length > 0) {
      // This is a group - flatten it into a section
      sections.push({
        title: item.label.toUpperCase(),
        items: item.children,
      });
    } else {
      // Single item - add to a misc section or last section
      if (sections.length > 1) {
        sections[sections.length - 1].items.push(item);
      } else {
        sections.push({
          title: "NAVIGATION",
          items: [item],
        });
      }
    }
  });

  return (
    <nav className="space-y-4">
      {sections.map((section, sectionIndex) => (
        <SectionGroup
          key={section.title + sectionIndex}
          title={section.title}
          isCollapsed={isCollapsed}
        >
          {section.items.map((item, itemIndex) => (
            <SectionNavItem
              key={item.to || item.label + itemIndex}
              to={item.to || "/"}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          ))}
        </SectionGroup>
      ))}
    </nav>
  );
};

// ==========================================
// DROPDOWN LAYOUT RENDERER
// ==========================================

interface DropdownLayoutProps {
  items: NavItemConfig[];
  isCollapsed: boolean;
  onNavigate?: () => void;
}

const DropdownLayout = ({
  items,
  isCollapsed,
  onNavigate,
}: DropdownLayoutProps) => {
  return (
    <nav className="space-y-1">
      {items.map((item, index) => (
        <NavItem
          key={item.to || item.label + index}
          {...item}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
};

// ==========================================
// MAIN SIDEBAR COMPONENT
// ==========================================

export const AppSidebar = ({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}: AppSidebarProps) => {
  // Get sidebar config from context - need to handle case where provider might not exist
  let displayStyle: SidebarDisplayStyle = "dropdown";
  let isRouteVisibleFn = (_path: string) => true;

  try {
    const sidebarConfig = useSidebarConfig();
    displayStyle = sidebarConfig.displayStyle;
    isRouteVisibleFn = sidebarConfig.isRouteVisible;
  } catch {
    // Provider not available, use defaults
    console.log("[AppSidebar] SidebarConfigProvider not found, using defaults");
  }

  const filteredNavItems = useFilteredNavigation(isRouteVisibleFn);
  const { userProfile } = useAuth();
  const { permissions, isLoading } = usePermissions();

  const effectiveCollapsed = isCollapsed && !isMobileOpen;

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
              <span className="text-xl font-bold text-foreground">
                EduMunch
              </span>
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
              {!effectiveCollapsed && (
                <p className="text-sm text-muted-foreground">Loading menu...</p>
              )}
            </div>
          ) : displayStyle === "sections" ? (
            <SectionsLayout
              items={filteredNavItems}
              isCollapsed={effectiveCollapsed}
              onNavigate={onMobileClose}
            />
          ) : (
            <DropdownLayout
              items={filteredNavItems}
              isCollapsed={effectiveCollapsed}
              onNavigate={onMobileClose}
            />
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
                  {userProfile?.full_name || "User"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {userProfile?.primary_role?.role_name ||
                    userProfile?.email ||
                    ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
