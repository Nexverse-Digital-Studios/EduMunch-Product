/**
 * Dashboard.tsx - Main Dashboard with Real-time Stats
 * 
 * Fetches counts from multiple Supabase tables:
 * - students_1EMAET, admissions_1EMAET, batches_1EMAET
 * - attendance_1EMAET, teachers_1EMAET
 * - announcements_1EMAET
 */
import { useMemo } from "react";
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
} from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1emaet';

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
  
  // Get display name and role
  const displayName = userProfile?.full_name || 'User';
  const roleName = userProfile?.primary_role?.role_name || 'Admin';

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
    </div>
  );
};

export default Dashboard;
