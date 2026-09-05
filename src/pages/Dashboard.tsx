/**
 * Dashboard.tsx - Main Dashboard with Real-time Stats
 * 
 * Fetches counts from multiple Supabase tables:
 * - students_1EMAET, admissions_1EMAET, batches_1EMAET
 * - attendance_1EMAET, teachers_1EMAET
 * - announcements_1EMAET
 */
import { useMemo, useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  BarChart3,
  GraduationCap,
  Calendar,
  CheckSquare,
  XSquare,
  UserCheck,
  IndianRupee,
  FileX,
  Receipt,
  HelpCircle,
  Ticket,
  CalendarDays,
  CalendarCheck,
  ArrowLeftRight,
  AlertTriangle,
  Loader2,
  Shield,
  Key,
  ChevronRight,
  Database,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { AnnouncementItem } from "@/components/dashboard/AnnouncementItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { supabase, INDEX_TOKEN } from "@/lib/supabase";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface DebugInfo {
  userRolesCount: number;
  userRoles: any[];
  rpcResult: any[];
  rpcError: string | null;
  rolePermissionsCount: number;
}

interface Student {
  id: string;
  is_active: boolean;
  created_at: string;
}

interface Batch {
  id: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  publish_date: string;
  created_by: string;
}

interface Teacher {
  id: string;
  is_active: boolean;
}

const Dashboard = () => {
  const { userProfile } = useAuth();
  const { permissions, isAdmin, isLoading: permissionsLoading } = usePermissions();
  
  // Debug state for direct database queries
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  // Function to directly query database for debugging
  const runDebugQueries = async () => {
    if (!supabase || !userProfile?.id) return;
    
    setDebugLoading(true);
    const info: DebugInfo = {
      userRolesCount: 0,
      userRoles: [],
      rpcResult: [],
      rpcError: null,
      rolePermissionsCount: 0,
    };

    try {
      // 1. Check user_roles table
      const { data: userRoles, error: urError } = await supabase
        .from(`user_roles_${INDEX_TOKEN}`)
        .select('*, role:role_id(id, role_code, role_name)')
        .eq('user_id', userProfile.id);
      
      if (urError) {
        console.error('user_roles query error:', urError);
        info.userRoles = [{ error: urError.message }];
      } else {
        info.userRoles = userRoles || [];
        info.userRolesCount = userRoles?.length || 0;
      }

      // 2. Call the RPC function directly
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        `get_user_permissions_${INDEX_TOKEN}`,
        { p_user_id: userProfile.id }
      );

      if (rpcError) {
        console.error('RPC error:', rpcError);
        info.rpcError = rpcError.message;
      } else {
        info.rpcResult = rpcData || [];
      }

      // 3. Count role_permissions for the user's role
      if (userProfile.primary_role_id) {
        const { count, error: rpError } = await supabase
          .from(`role_permissions_${INDEX_TOKEN}`)
          .select('*', { count: 'exact', head: true })
          .eq('role_id', userProfile.primary_role_id);
        
        if (!rpError) {
          info.rolePermissionsCount = count || 0;
        }
      }

    } catch (err: any) {
      console.error('Debug query error:', err);
      info.rpcError = err.message;
    }

    setDebugInfo(info);
    setDebugLoading(false);
  };

  // Run debug queries on mount
  useEffect(() => {
    if (userProfile?.id && !debugInfo) {
      runDebugQueries();
    }
  }, [userProfile?.id]);
  
  // Get display name and role
  const displayName = userProfile?.full_name || 'User';
  const roleName = userProfile?.primary_role?.role_name || 'Admin';
  const roleCode = userProfile?.primary_role?.role_code || 'unknown';

  // Get accessible modules from permissions
  const accessibleModules = useMemo(() => {
    if (!permissions) return [];
    if (isAdmin()) {
      return [{ moduleCode: 'ALL', label: 'All Modules (Admin Bypass)' }];
    }
    
    const modules: { moduleCode: string; canView: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean }[] = [];
    
    Object.entries(permissions.permissions).forEach(([moduleCode, perms]) => {
      if (perms.canView || perms.canCreate || perms.canUpdate || perms.canDelete) {
        modules.push({
          moduleCode,
          canView: perms.canView,
          canCreate: perms.canCreate,
          canUpdate: perms.canUpdate,
          canDelete: perms.canDelete,
        });
      }
    });
    
    return modules;
  }, [permissions, isAdmin]);

  // Module to route mapping for quick navigation
  const moduleRoutes: Record<string, { path: string; label: string }> = {
    dashboard: { path: '/', label: 'Dashboard' },
    profile: { path: '/profile', label: 'My Profile' },
    users: { path: '/users', label: 'Users' },
    roles: { path: '/roles', label: 'Roles' },
    permissions: { path: '/permissions', label: 'Permissions' },
    students: { path: '/students', label: 'Students' },
    parents: { path: '/parents', label: 'Parents' },
    teachers: { path: '/teachers', label: 'Teachers' },
    employees: { path: '/employees', label: 'Employees' },
    attendance: { path: '/attendance', label: 'Student Attendance' },
    staff_attendance: { path: '/staff-attendance', label: 'Staff Attendance' },
    leave: { path: '/leave-management', label: 'Student Leave' },
    staff_leave: { path: '/staff-leave', label: 'Staff Leave' },
    academic_years: { path: '/academic-years', label: 'Academic Years' },
    classes: { path: '/classes', label: 'Classes' },
    sections: { path: '/sections', label: 'Sections' },
    subjects: { path: '/subjects', label: 'Subjects' },
    topics: { path: '/topics', label: 'Topics' },
    timetable: { path: '/timetables', label: 'Timetables' },
    lecture_templates: { path: '/lecture-templates', label: 'Lecture Templates' },
    exams: { path: '/exams', label: 'Exams' },
    marks: { path: '/marks', label: 'Marks Entry' },
    report_cards: { path: '/report-cards', label: 'Report Cards' },
    fees: { path: '/fees', label: 'Fee Management' },
    settings: { path: '/settings', label: 'Settings' },
    id_cards: { path: '/id-cards', label: 'ID Cards' },
    reports: { path: '/reports', label: 'Reports' },
    announcements: { path: '/announcements', label: 'Announcements' },
    notifications: { path: '/notifications', label: 'Notifications' },
    messages: { path: '/messages', label: 'Messages' },
    assignments: { path: '/assignments', label: 'Assignments' },
    study_materials: { path: '/study-materials', label: 'Study Materials' },
    online_classes: { path: '/online-classes', label: 'Online Classes' },
    homework: { path: '/homework', label: 'Homework' },
    doubts: { path: '/doubts', label: 'Doubts' },
    transport: { path: '/transport', label: 'Transport' },
    payroll: { path: '/payroll', label: 'Payroll' },
    salary_structures: { path: '/salary-structures', label: 'Salary Structures' },
    payslips: { path: '/payslips', label: 'Payslips' },
    appraisals: { path: '/appraisals', label: 'Appraisals' },
    recruitment: { path: '/recruitment', label: 'Recruitment' },
    feedback: { path: '/feedback', label: 'Feedback' },
    grievances: { path: '/grievances', label: 'Grievances' },
    support_tickets: { path: '/support-tickets', label: 'Support Tickets' },
    analytics: { path: '/analytics', label: 'Analytics' },
    ptm_requests: { path: '/ptm-requests', label: 'PTM Requests' },
    alumni: { path: '/alumni', label: 'Alumni' },
    admissions: { path: '/admissions', label: 'Admissions' },
    inventory: { path: '/inventory', label: 'Inventory' },
    certificates: { path: '/certificates', label: 'Certificates' },
    surveys: { path: '/surveys', label: 'Surveys' },
    branches: { path: '/branches', label: 'Branches' },
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  // Fetch students
  const { data: students = [], isLoading: loadingStudents } = useSupabaseTable<Student>(
    `students_${INDEX_TOKEN}`,
    { select: 'id, is_active, created_at', enabled: false }
  );

  // Fetch batches
  const { data: batches = [], isLoading: loadingBatches } = useSupabaseTable<Batch>(
    `batches_${INDEX_TOKEN}`,
    { select: 'id', enabled: false }
  );

  // Fetch teachers
  const { data: teachers = [], isLoading: loadingTeachers } = useSupabaseTable<Teacher>(
    `teachers_${INDEX_TOKEN}`,
    { select: 'id, is_active', enabled: false }
  );

  // Fetch announcements
  const { data: announcements = [], isLoading: loadingAnnouncements } = useSupabaseTable<Announcement>(
    `announcements_${INDEX_TOKEN}`,
    { 
      select: 'id, title, content, publish_date, created_by',
      orderBy: { column: 'publish_date', ascending: false },
      enabled: false
    }
  );

  // Calculate stats
  const stats = useMemo(() => {
    const activeStudents = students.filter(s => s.is_active).length;
    const newAdmissions = students.filter(s => s.created_at >= thirtyDaysAgo).length;
    const activeTeachers = teachers.filter(t => t.is_active).length;

    return [
      { title: "Active Students", value: activeStudents, icon: Users, colorScheme: "blue" as const },
      { title: "New Admissions (30d)", value: newAdmissions, icon: UserPlus, colorScheme: "green" as const },
      { title: "Total Batches", value: batches.length, icon: BarChart3, colorScheme: "purple" as const },
      { title: "Total Teachers", value: teachers.length, icon: GraduationCap, colorScheme: "teal" as const },
      { title: "Active Teachers", value: activeTeachers, icon: UserCheck, colorScheme: "blue" as const },
      { title: "Announcements", value: announcements.length, icon: Calendar, colorScheme: "green" as const },
    ];
  }, [students, batches, teachers, announcements, thirtyDaysAgo]);

  const isLoading = loadingStudents || loadingBatches || loadingTeachers || loadingAnnouncements;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Logged in as <span className="font-medium text-primary">{roleName}</span> • Here's a quick overview of your portal.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm text-muted-foreground">Academic Year</span>
          <Select defaultValue="2024-25">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2023-24">2023-24</SelectItem>
              <SelectItem value="2022-23">2022-23</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              colorScheme={stat.colorScheme}
            />
          ))}
        </div>
      )}

      {/* Announcements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span>📢</span>
            Recent Announcements
          </CardTitle>
          <Button variant="link" className="text-primary p-0 h-auto">
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingAnnouncements ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : announcements.length > 0 ? (
            announcements.slice(0, 5).map((announcement) => (
              <AnnouncementItem
                key={announcement.id}
                title={announcement.title}
                date={format(new Date(announcement.publish_date), 'MMMM d, yyyy')}
                source={announcement.created_by || 'System'}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No announcements yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Permission Debug Section - Shows accessible modules and routes */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Key className="h-5 w-5 text-primary" />
            Your Permissions & Accessible Routes
            <Badge variant="outline" className="ml-2">
              {roleCode}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Role: <span className="font-semibold text-primary">{roleName}</span> • 
            {isAdmin() ? (
              <span className="ml-1 text-green-500 font-medium">Admin Access (Full Permissions)</span>
            ) : (
              <span className="ml-1">{accessibleModules.length} modules accessible</span>
            )}
          </p>
        </CardHeader>
        <CardContent>
          {permissionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading permissions...</span>
            </div>
          ) : !permissions ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-muted-foreground">No permissions loaded. Try logging out and back in.</p>
              <p className="text-xs text-muted-foreground mt-2">
                Check browser console for permission errors.
              </p>
            </div>
          ) : isAdmin() ? (
            <div className="text-center py-4">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-medium text-green-600">Administrator Access</p>
              <p className="text-sm text-muted-foreground">
                You have full access to all modules and routes.
              </p>
            </div>
          ) : accessibleModules.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-medium text-yellow-600">No module permissions found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your role ({roleCode}) doesn't have any permissions assigned yet.
                </p>
              </div>
              
              {/* Database Debug Section */}
              <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database Debug Info
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={runDebugQueries}
                    disabled={debugLoading}
                  >
                    {debugLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>
                
                <div className="space-y-2 text-xs">
                  <p><strong>INDEX_TOKEN:</strong> {INDEX_TOKEN}</p>
                  <p><strong>User ID:</strong> {userProfile?.id || 'N/A'}</p>
                  <p><strong>Primary Role ID:</strong> {userProfile?.primary_role_id || 'N/A'}</p>
                  <p><strong>Primary Role Code:</strong> {roleCode}</p>
                  
                  {debugInfo && (
                    <>
                      <hr className="my-2" />
                      <p className="font-medium text-sm mb-1">Database Query Results:</p>
                      
                      <p><strong>user_roles_{INDEX_TOKEN} entries:</strong> {debugInfo.userRolesCount}</p>
                      {debugInfo.userRoles.length > 0 && (
                        <pre className="p-2 bg-background rounded text-xs overflow-auto max-h-32">
{JSON.stringify(debugInfo.userRoles, null, 2)}
                        </pre>
                      )}
                      
                      <p className="mt-2"><strong>role_permissions_{INDEX_TOKEN} count for role:</strong> {debugInfo.rolePermissionsCount}</p>
                      
                      <p className="mt-2"><strong>RPC get_user_permissions_{INDEX_TOKEN} result:</strong> {debugInfo.rpcResult.length} items</p>
                      {debugInfo.rpcError && (
                        <p className="text-red-500"><strong>RPC Error:</strong> {debugInfo.rpcError}</p>
                      )}
                      {debugInfo.rpcResult.length > 0 && (
                        <pre className="p-2 bg-background rounded text-xs overflow-auto max-h-40">
{JSON.stringify(debugInfo.rpcResult.slice(0, 5), null, 2)}
{debugInfo.rpcResult.length > 5 && `\n... and ${debugInfo.rpcResult.length - 5} more`}
                        </pre>
                      )}
                    </>
                  )}
                  
                  {!debugInfo && !debugLoading && (
                    <p className="text-muted-foreground">Click Refresh to run database queries</p>
                  )}
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-lg text-left text-xs">
                <p className="font-medium mb-1">Permission Cache Info:</p>
                <p>User ID: {permissions?.userId || 'N/A'}</p>
                <p>Primary Role: {permissions?.primaryRole?.code || 'N/A'}</p>
                <p>Permissions Object Keys: {Object.keys(permissions?.permissions || {}).length}</p>
                <p>Cache Timestamp: {permissions?.timestamp ? new Date(permissions.timestamp).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Module list with permissions */}
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {accessibleModules.map((module) => {
                  const route = moduleRoutes[module.moduleCode];
                  return (
                    <div 
                      key={module.moduleCode}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {route?.label || module.moduleCode}
                        </p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {module.canView && <Badge variant="secondary" className="text-xs px-1.5 py-0">View</Badge>}
                          {module.canCreate && <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-green-100 text-green-700">Create</Badge>}
                          {module.canUpdate && <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-blue-100 text-blue-700">Update</Badge>}
                          {module.canDelete && <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-red-100 text-red-700">Delete</Badge>}
                        </div>
                      </div>
                      {route && (
                        <Link 
                          to={route.path}
                          className="ml-2 p-1.5 rounded-md hover:bg-primary/10 text-primary"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Raw permission data for debugging */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Show Raw Permission Data (Debug)
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-60">
{JSON.stringify({
  userId: permissions?.userId,
  primaryRole: permissions?.primaryRole,
  moduleCount: Object.keys(permissions?.permissions || {}).length,
  modules: Object.keys(permissions?.permissions || {}),
  permissions: permissions?.permissions,
  timestamp: permissions?.timestamp ? new Date(permissions.timestamp).toLocaleString() : null,
}, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
