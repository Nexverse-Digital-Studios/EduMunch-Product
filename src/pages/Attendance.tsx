import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckSquare, Edit, FileText, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

// Database types based on schema
interface AttendanceDB {
  id: string;
  student_id: string;
  class_id: string;
  section_id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  marked_by?: string;
  marked_at?: string;
  remarks?: string;
  created_at: string;
}

interface TimetableDB {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  period_id: string;
  day_of_week: number;
  room_number?: string;
  is_active: boolean;
}

interface SectionDB {
  id: string;
  class_id: string;
  section_name: string;
  section_code: string;
}

interface StudentDB {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  section_id: string;
}

interface TeacherDB {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
}

const Attendance = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  
  // Fetch data from Supabase
  const { data: sections, isLoading: loadingSections } = useSupabaseTable<SectionDB>(
    TABLES.SECTIONS,
    { orderBy: { column: 'section_name', ascending: true } }
  );
  
  const { data: students, isLoading: loadingStudents } = useSupabaseTable<StudentDB>(
    TABLES.STUDENTS,
    { orderBy: { column: 'first_name', ascending: true } }
  );
  
  const { data: teachers, isLoading: loadingTeachers } = useSupabaseTable<TeacherDB>(
    TABLES.TEACHERS,
    { orderBy: { column: 'first_name', ascending: true } }
  );
  
  const { data: timetables, isLoading: loadingTimetables } = useSupabaseTable<TimetableDB>(
    TABLES.TIMETABLES,
    {}
  );
  
  const { data: attendance, isLoading: loadingAttendance } = useSupabaseTable<AttendanceDB>(
    TABLES.ATTENDANCE,
    { orderBy: { column: 'attendance_date', ascending: false } }
  );
  
  const isLoading = loadingSections || loadingStudents || loadingTeachers || loadingTimetables || loadingAttendance;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
          Weekly Attendance & Lecture Management
        </h1>
        <div className="flex gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
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
          {activeTab === "schedule" && <ScheduleTab sections={sections || []} timetables={timetables || []} />}
          {activeTab === "reports" && <ReportsTab teachers={teachers || []} />}
          {activeTab === "student-report" && <StudentReportTab students={students || []} attendance={attendance || []} sections={sections || []} />}
        </>
      )}
    </div>
  );
};

interface ScheduleTabProps {
  sections: SectionDB[];
  timetables: TimetableDB[];
}

const ScheduleTab = ({ sections, timetables }: ScheduleTabProps) => {
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // For now, show empty state since timetable data needs to be populated
  const hasSchedule = timetables.length > 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Filter by Section (Optional)</label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.section_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Select a day in week</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1" 
              />
              <Button variant="outline" size="icon" onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {!hasSchedule ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No timetable data found. Create timetables first to view schedule.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Schedule cards would be rendered here based on timetable data */}
        </div>
      )}
    </div>
  );
};

interface ReportsTabProps {
  teachers: TeacherDB[];
}

const ReportsTab = ({ teachers }: ReportsTabProps) => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Syllabus Status
          </CardTitle>
          <span className="text-sm text-muted-foreground">Batch: None selected</span>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Choose a batch to view syllabus progress.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Teacher Activity Log
          </CardTitle>
          <Button variant="link" className="p-0 h-auto text-primary">View recent remarks</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Select Teacher</label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.first_name} {t.last_name} ({t.employee_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-auto">
            {selectedTeacher ? (
              <p className="text-center text-muted-foreground py-4">
                No activity logs found for this teacher.
              </p>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Select a teacher to view their activity log.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StudentReportTabProps {
  students: StudentDB[];
  attendance: AttendanceDB[];
  sections: SectionDB[];
}

const StudentReportTab = ({ students, attendance, sections }: StudentReportTabProps) => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const filteredRecords = selectedStudent 
    ? attendance.filter(a => a.student_id === selectedStudent) 
    : [];
    
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5" />
            Filter Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">Select Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.admission_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-32">
              <label className="mb-1.5 block text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">January</SelectItem>
                  <SelectItem value="1">February</SelectItem>
                  <SelectItem value="2">March</SelectItem>
                  <SelectItem value="3">April</SelectItem>
                  <SelectItem value="4">May</SelectItem>
                  <SelectItem value="5">June</SelectItem>
                  <SelectItem value="6">July</SelectItem>
                  <SelectItem value="7">August</SelectItem>
                  <SelectItem value="8">September</SelectItem>
                  <SelectItem value="9">October</SelectItem>
                  <SelectItem value="10">November</SelectItem>
                  <SelectItem value="11">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-32">
              <label className="mb-1.5 block text-sm font-medium">Year</label>
              <Input 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              />
            </div>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Get Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Attendance Records</CardTitle>
          <span className="text-sm text-muted-foreground">{filteredRecords.length} records found</span>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {selectedStudent ? "No attendance records found for this student." : "Select a student to view their attendance."}
            </div>
          ) : (
          <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DATE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>REMARKS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.status === "present" ? "default" : record.status === "absent" ? "destructive" : "secondary"}
                      >
                        {record.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.remarks || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredRecords.map((record) => (
              <div key={record.id} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                  <Badge variant={record.status === "present" ? "default" : record.status === "absent" ? "destructive" : "secondary"}>
                    {record.status.toUpperCase()}
                  </Badge>
                </div>
                {record.remarks && (
                  <p className="text-sm text-muted-foreground">{record.remarks}</p>
                )}
              </div>
            ))}
          </div>
          </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
