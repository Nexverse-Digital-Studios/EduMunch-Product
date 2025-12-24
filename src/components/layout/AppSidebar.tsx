import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItemProps {
  to?: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  children?: NavItemProps[];
  isActive?: boolean;
  onNavigate?: () => void;
}

const NavItem = ({ to, icon: Icon, label, isCollapsed, children, isActive, onNavigate }: NavItemProps) => {
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

const navigationItems: NavItemProps[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", isCollapsed: false },
  {
    icon: GraduationCap,
    label: "Admissions",
    isCollapsed: false,
    children: [
      { to: "/admissions", icon: GraduationCap, label: "Admissions", isCollapsed: false },
      { to: "/enrollments", icon: Users, label: "Enrollments", isCollapsed: false },
      { to: "/payments", icon: IndianRupee, label: "Payments", isCollapsed: false },
    ],
  },
  {
    icon: BookOpen,
    label: "Academics",
    isCollapsed: false,
    children: [
      { to: "/courses", icon: BookOpen, label: "Courses", isCollapsed: false },
      { to: "/subjects", icon: BookText, label: "Subjects", isCollapsed: false },
      { to: "/topics", icon: ListTree, label: "Topics & Content", isCollapsed: false },
      { to: "/batches", icon: Calendar, label: "Batches", isCollapsed: false },
      { to: "/timetables", icon: Clock, label: "Timetables", isCollapsed: false },
      { to: "/attendance", icon: CheckSquare, label: "Attendance", isCollapsed: false },
      { to: "/assignments", icon: ClipboardList, label: "Assignments", isCollapsed: false },
      { to: "/results", icon: Award, label: "Results", isCollapsed: false },
      { to: "/lecture-templates", icon: Presentation, label: "Lecture Templates", isCollapsed: false },
    ],
  },
  {
    icon: Settings,
    label: "Administration",
    isCollapsed: false,
    children: [
      { to: "/users", icon: Users, label: "Users", isCollapsed: false },
      { to: "/roles", icon: UserCog, label: "Roles & Permissions", isCollapsed: false },
      { to: "/branches", icon: Building2, label: "Branches", isCollapsed: false },
      { to: "/inventory", icon: Warehouse, label: "Inventory", isCollapsed: false },
      { to: "/tie-up-schools", icon: School, label: "Tie-Up Schools", isCollapsed: false },
    ],
  },
  {
    icon: Building2,
    label: "Human Resources",
    isCollapsed: false,
    children: [
      { to: "/employees", icon: Users, label: "Employees", isCollapsed: false },
      { to: "/salary-structures", icon: Receipt, label: "Salary Structures", isCollapsed: false },
      { to: "/payslips", icon: Receipt, label: "Payslips", isCollapsed: false },
      { to: "/leave-management", icon: CalendarDays, label: "Leave Management", isCollapsed: false },
      { to: "/working-hours", icon: Timer, label: "Working Hours", isCollapsed: false },
      { to: "/availability-slots", icon: UserCheck, label: "Availability Slots", isCollapsed: false },
    ],
  },
  {
    icon: MessageSquare,
    label: "Communication",
    isCollapsed: false,
    children: [
      { to: "/announcements", icon: Bell, label: "Announcements", isCollapsed: false },
      { to: "/doubts", icon: HelpCircle, label: "Doubts", isCollapsed: false },
      { to: "/support-tickets", icon: Ticket, label: "Support Tickets", isCollapsed: false },
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

export const AppSidebar = ({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: AppSidebarProps) => {
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
            {navigationItems.map((item, index) => (
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
                <p className="truncate text-sm font-medium text-foreground">Super Admin</p>
                <p className="truncate text-xs text-muted-foreground">super@admin.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
