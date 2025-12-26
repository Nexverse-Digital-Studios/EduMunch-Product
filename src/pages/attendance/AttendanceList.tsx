/**
 * Attendance List Page
 * =====================
 * Main attendance management page with tabs for:
 * - Schedule: View timetable/schedule by section and date
 * - Reports: Syllabus status and teacher activity logs
 * - Student Report: Individual student attendance records
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  ClipboardCheck,
  Calendar,
  FileText,
  BookOpen,
  Download,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import {
  ScheduleTab,
  ReportsTab,
  StudentReportTab,
  SectionDB,
  TimetableDB,
  TeacherDB,
  StudentDB,
  AttendanceDB,
} from "./components";

const AttendanceList = () => {
  const navigate = useNavigate();
  const { canCreate, canView } = useModulePermissions("attendance");
  const [activeTab, setActiveTab] = useState("schedule");

  // Fetch data from Supabase
  const { data: sections, isLoading: loadingSections } =
    useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
      orderBy: { column: "section_name", ascending: true },
    });

  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentDB>(TABLES.STUDENTS, {
      orderBy: { column: "first_name", ascending: true },
    });

  const { data: teachers, isLoading: loadingTeachers } =
    useSupabaseTable<TeacherDB>(TABLES.TEACHERS, {
      orderBy: { column: "first_name", ascending: true },
    });

  const { data: timetables, isLoading: loadingTimetables } =
    useSupabaseTable<TimetableDB>(TABLES.TIMETABLES, {});

  const { data: attendance, isLoading: loadingAttendance } =
    useSupabaseTable<AttendanceDB>(TABLES.ATTENDANCE, {
      orderBy: { column: "attendance_date", ascending: false },
    });

  const isLoading =
    loadingSections ||
    loadingStudents ||
    loadingTeachers ||
    loadingTimetables ||
    loadingAttendance;

  // Quick action cards
  const quickActions = [
    {
      title: "Mark Attendance",
      description: "Mark daily attendance for a class",
      icon: ClipboardCheck,
      route: "/attendance/mark",
      permission: canCreate,
      color: "text-green-600",
    },
    {
      title: "View Attendance",
      description: "View and filter attendance records",
      icon: Calendar,
      route: "/attendance/view",
      permission: canView,
      color: "text-blue-600",
    },
    {
      title: "Reports",
      description: "Generate attendance reports",
      icon: FileText,
      route: "/attendance/reports",
      permission: canView,
      color: "text-purple-600",
    },
    {
      title: "Subject-wise",
      description: "Mark subject-wise attendance",
      icon: BookOpen,
      route: "/attendance/subject-wise",
      permission: canCreate,
      color: "text-orange-600",
    },
    {
      title: "Export Data",
      description: "Download attendance data",
      icon: Download,
      route: "/attendance/export",
      permission: canView,
      color: "text-cyan-600",
    },
    {
      title: "Leave Requests",
      description: "Manage student leave applications",
      icon: Calendar,
      route: "/leave-requests",
      permission: canView,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
            Attendance Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage student attendance
          </p>
        </div>
        <div className="flex gap-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="student-report">Student Report</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {quickActions.map(
          (action) =>
            action.permission && (
              <Card
                key={action.route}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(action.route)}
              >
                <CardContent className="p-4">
                  <action.icon className={`h-8 w-8 mb-2 ${action.color}`} />
                  <h3 className="font-medium">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            )
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading attendance data...</span>
        </div>
      ) : (
        <>
          {activeTab === "schedule" && (
            <ScheduleTab
              sections={sections || []}
              timetables={timetables || []}
            />
          )}
          {activeTab === "reports" && <ReportsTab teachers={teachers || []} />}
          {activeTab === "student-report" && (
            <StudentReportTab
              students={students || []}
              attendance={attendance || []}
              sections={sections || []}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceList;
