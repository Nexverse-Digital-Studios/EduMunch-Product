/**
 * App Sidebar - EduMunch
 * =======================
 * 
 * Dynamic navigation based on:
 * 1. Feature toggles (from config)
 * 2. User permissions (from PermissionContext)
 * 3. Admin-only routes
 */

import { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  IndianRupee,
  BookOpen,
  BookText,
  ListTree,
  Calendar,
  Clock,
  CheckSquare,
  ClipboardList,
  Award,
  Presentation,
  Settings,
  Building2,
  Warehouse,
  School,
  UserCog,
  Receipt,
  CalendarDays,
  Timer,
  UserCheck,
  MessageSquare,
  Bell,
  HelpCircle,
  Ticket,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  X,
  Shield,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FEATURES, FeatureConfig } from "@/config/features.config";
import { usePermissions } from "@/contexts/PermissionContext";
import { useAuth } from "@/contexts/AuthContext";

interface NavItemConfig {
  to?: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  children?: NavItemConfig[];
  isActive?: boolean;
  onNavigate?: () => void;
  feature?: keyof FeatureConfig;  // Feature toggle key
  moduleCode?: string;             // Permission module code
  adminOnly?: boolean;             // Requires admin role
}

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
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
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
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
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

const navigationItems: NavItemConfig[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", isCollapsed: false },
  {
    icon: GraduationCap,
    label: "Admissions",
    isCollapsed: false,
    feature: 'admissions',
    children: [
      { to: "/admissions", icon: GraduationCap, label: "Admissions", isCollapsed: false, feature: 'admissions', moduleCode: 'admissions' },
      { to: "/enrollments", icon: Users, label: "Enrollments", isCollapsed: false, feature: 'payments', moduleCode: 'payments' },
      { to: "/payments", icon: IndianRupee, label: "Payments", isCollapsed: false, feature: 'payments', moduleCode: 'payments' },
    ],
  },
  {
    icon: BookOpen,
    label: "Academics",
    isCollapsed: false,
    children: [
      { to: "/classes", icon: BookOpen, label: "Classes", isCollapsed: false, feature: 'classes', moduleCode: 'classes' },
      { to: "/subjects", icon: BookText, label: "Subjects", isCollapsed: false, feature: 'subjects', moduleCode: 'subjects' },
      { to: "/topics", icon: ListTree, label: "Topics & Content", isCollapsed: false, feature: 'topics', moduleCode: 'topics' },
      { to: "/batches", icon: Calendar, label: "Sections", isCollapsed: false, feature: 'sections', moduleCode: 'sections' },
      { to: "/timetables", icon: Clock, label: "Timetables", isCollapsed: false, feature: 'timetables', moduleCode: 'timetable' },
      { to: "/attendance", icon: CheckSquare, label: "Attendance", isCollapsed: false, feature: 'attendance', moduleCode: 'attendance' },
      { to: "/assignments", icon: ClipboardList, label: "Assignments", isCollapsed: false, feature: 'assignments', moduleCode: 'assignments' },
      { to: "/results", icon: Award, label: "Results", isCollapsed: false, feature: 'results', moduleCode: 'marks' },
      { to: "/lecture-templates", icon: Presentation, label: "Lecture Templates", isCollapsed: false, feature: 'lectureTemplates', moduleCode: 'lecture_templates' },
    ],
  },
  {
    icon: Settings,
    label: "Administration",
    isCollapsed: false,
    children: [
      { to: "/users", icon: Users, label: "Users", isCollapsed: false, feature: 'users', moduleCode: 'users' },
      { to: "/roles", icon: UserCog, label: "Roles", isCollapsed: false, feature: 'roles', moduleCode: 'roles' },
      { to: "/set-roles", icon: Shield, label: "Configure Roles", isCollapsed: false, feature: 'setRoles', adminOnly: true },
      { to: "/branches", icon: Building2, label: "Branches", isCollapsed: false, feature: 'branches', moduleCode: 'branches' },
      { to: "/inventory", icon: Warehouse, label: "Inventory", isCollapsed: false, feature: 'inventory', moduleCode: 'inventory' },
      { to: "/tie-up-schools", icon: School, label: "Tie-Up Schools", isCollapsed: false, feature: 'tieUpSchools', moduleCode: 'tie_up_schools' },
    ],
  },
  {
    icon: Building2,
    label: "Human Resources",
    isCollapsed: false,
    children: [
      { to: "/employees", icon: Users, label: "Employees", isCollapsed: false, feature: 'employees', moduleCode: 'employees' },
      { to: "/salary-structures", icon: Receipt, label: "Salary Structures", isCollapsed: false, feature: 'salaryStructures', moduleCode: 'salary_structures' },
      { to: "/payslips", icon: Receipt, label: "Payslips", isCollapsed: false, feature: 'payslips', moduleCode: 'payslips' },
      { to: "/leave-management", icon: CalendarDays, label: "Leave Management", isCollapsed: false, feature: 'leaveManagement', moduleCode: 'leave' },
      { to: "/working-hours", icon: Timer, label: "Working Hours", isCollapsed: false, feature: 'workingHours', moduleCode: 'working_hours' },
      { to: "/availability-slots", icon: UserCheck, label: "Availability Slots", isCollapsed: false, feature: 'availabilitySlots', moduleCode: 'availability_slots' },
    ],
  },
  {
    icon: MessageSquare,
    label: "Communication",
    isCollapsed: false,
    children: [
      { to: "/announcements", icon: Bell, label: "Announcements", isCollapsed: false, feature: 'announcements', moduleCode: 'announcements' },
      { to: "/doubts", icon: HelpCircle, label: "Doubts", isCollapsed: false, feature: 'doubts', moduleCode: 'doubts' },
      { to: "/notifications", icon: Bell, label: "Notifications", isCollapsed: false, feature: 'notifications', moduleCode: 'notifications' },
      { to: "/feedback", icon: MessageSquare, label: "Feedback", isCollapsed: false, feature: 'feedback', moduleCode: 'feedback' },
      { to: "/grievances", icon: AlertCircle, label: "Grievances", isCollapsed: false, feature: 'grievances', moduleCode: 'grievances' },
      { to: "/ptm-requests", icon: Users, label: "PTM Requests", isCollapsed: false, feature: 'ptmRequests', moduleCode: 'ptm_requests' },
      { to: "/support-tickets", icon: Ticket, label: "Support Tickets", isCollapsed: false, feature: 'supportTickets', moduleCode: 'support_tickets' },
    ],
  },
  { to: "/profile", icon: User, label: "Profile", isCollapsed: false },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

/**
 * Filter navigation items based on features and permissions
 */
const useFilteredNavigation = () => {
  const { hasModuleAccess, isAdmin } = usePermissions();
  const { userProfile } = useAuth();
  
  return useMemo(() => {
    console.log('[AppSidebar] Filtering navigation items:', {
      isAdmin: isAdmin(),
      userId: userProfile?.id,
    });

    const filterItems = (items: NavItemConfig[]): NavItemConfig[] => {
      return items
        .filter(item => {
          // Check admin-only
          if (item.adminOnly && !isAdmin()) {
            console.log(`[AppSidebar] Filtering out admin-only item: ${item.label}`);
            return false;
          }
          
          // Check feature toggle
          if (item.feature && !FEATURES[item.feature]) {
            console.log(`[AppSidebar] Filtering out disabled feature: ${item.label} (${item.feature})`);
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

          console.log(`[AppSidebar] Item passed filter: ${item.label}`);
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
  }, [hasModuleAccess, isAdmin, userProfile]);
};

export const AppSidebar = ({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: AppSidebarProps) => {
  const filteredNavItems = useFilteredNavigation();
  const { userProfile } = useAuth();
  
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
              <span className="text-lg font-bold text-foreground">EduMunch</span>
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
        </ScrollArea>

        {/* User Profile */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-sidebar-border bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">
                  {userProfile?.full_name || 'User'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
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
