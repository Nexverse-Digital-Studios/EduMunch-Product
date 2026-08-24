/**
 * Attendance List Page
 * =====================
 * Main attendance management page with tabs for:
 * - Schedule: View timetable/schedule by section and date
 * - Mark: Mark daily or subject-wise attendance (inline)
 * - Reports: Attendance reports and analytics
 * - Student Report: Individual student attendance records
 * 
 * CONSOLIDATED: All attendance features accessible via tabs (no sub-routes)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  ClipboardCheck,
  Calendar,
  FileText,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import {
  ScheduleTab,
  ReportsTab,
  StudentReportTab,
  MarkAttendancePage,
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

  // Tab configuration with permissions
  const tabs = [
    { value: "schedule", label: "Schedule", icon: Calendar, permission: canView },
    { value: "mark", label: "Mark Attendance", icon: ClipboardCheck, permission: canCreate },
    { value: "reports", label: "Reports", icon: BarChart3, permission: canView },
    { value: "student-report", label: "Student Report", icon: FileText, permission: canView },
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
          <Button 
            variant="outline" 
            onClick={() => navigate("/leave-requests")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Leave Requests
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          {tabs.filter(tab => tab.permission).map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="h-4 w-4 hidden sm:inline" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center h-64 mt-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading attendance data...</span>
          </div>
        ) : (
          <>
            <TabsContent value="schedule" className="mt-6">
              <ScheduleTab
                sections={sections || []}
                timetables={timetables || []}
              />
            </TabsContent>

            <TabsContent value="mark" className="mt-6">
              <MarkAttendancePage />
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <ReportsTab teachers={teachers || []} />
            </TabsContent>

            <TabsContent value="student-report" className="mt-6">
              <StudentReportTab
                students={students || []}
                attendance={attendance || []}
                sections={sections || []}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default AttendanceList;
