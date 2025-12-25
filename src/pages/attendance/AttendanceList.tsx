/**
 * Attendance List Page
 * =====================
 * Main attendance management page with tabs for:
 * - Schedule: View timetable/schedule by section and date
 * - Reports: Syllabus status and teacher activity logs
 * - Student Report: Individual student attendance records
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";
import {
  ScheduleTab,
  ReportsTab,
  StudentReportTab,
  type SectionDB,
  type TimetableDB,
  type TeacherDB,
  type StudentDB,
  type AttendanceDB,
} from "./components";

const AttendanceList = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
          Weekly Attendance & Lecture Management
        </h1>
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
