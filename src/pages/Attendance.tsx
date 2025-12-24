import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckSquare, Edit, FileText, User } from "lucide-react";
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

interface Session {
  id: string;
  code: string;
  subject: string;
  teacher: string;
  time: string;
  classroom: string;
}

interface AttendanceRecord {
  date: string;
  subject: string;
  batch: string;
  teacher: string;
  time: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "NOT_MARKED";
}

interface TeacherActivity {
  id: string;
  topic: string;
  subject: string;
  batch: string;
  date: string;
  status: "IN_PROGRESS" | "COMPLETED";
  description: string;
}

const sessionsData: Record<string, Session[]> = {
  "Monday, December 8, 2025": [
    { id: "1", code: "27KJ1", subject: "Phy", teacher: "MNP", time: "02:00 PM - 04:00 PM", classroom: "No classroom" },
    { id: "2", code: "27KJ1", subject: "Chemistry", teacher: "APCH", time: "04:30 PM - 06:30 PM", classroom: "No classroom" },
    { id: "3", code: "27KJ2", subject: "Math", teacher: "ASM", time: "04:30 PM - 06:30 PM", classroom: "No classroom" },
    { id: "4", code: "27KJ2", subject: "Biology", teacher: "ASB", time: "07:00 PM - 09:00 PM", classroom: "No classroom" },
    { id: "5", code: "27KN1", subject: "Math", teacher: "VSM", time: "07:00 PM - 09:00 PM", classroom: "No classroom" },
  ],
  "Tuesday, December 9, 2025": [
    { id: "6", code: "27KJ1", subject: "Chemistry", teacher: "JYCH", time: "02:00 PM - 04:00 PM", classroom: "" },
    { id: "7", code: "27KJ2", subject: "Math", teacher: "ASM", time: "04:30 PM - 06:30 PM", classroom: "" },
    { id: "8", code: "27KN1", subject: "Phy", teacher: "ZAP", time: "04:30 PM - 06:30 PM", classroom: "" },
  ],
};

const attendanceRecords: AttendanceRecord[] = [
  { date: "Mon, Dec 1", subject: "Math", batch: "26TJMA1", teacher: "ASM", time: "01:31 PM -03:30 PM", status: "NOT_MARKED" },
  { date: "Mon, Dec 8", subject: "Math", batch: "26TJMA1", teacher: "RCM", time: "01:30 PM -03:30 PM", status: "NOT_MARKED" },
  { date: "Wed, Dec 10", subject: "Math", batch: "26TJMA1", teacher: "RCM", time: "01:30 PM -03:30 PM", status: "LATE" },
  { date: "Mon, Dec 15", subject: "Math", batch: "26TJMA1", teacher: "RCM", time: "01:30 PM -03:30 PM", status: "NOT_MARKED" },
  { date: "Mon, Dec 15", subject: "Phy", batch: "26TJMA1", teacher: "ZAP", time: "03:45 PM -05:45 PM", status: "NOT_MARKED" },
  { date: "Mon, Dec 15", subject: "Biology", batch: "26TJMA1", teacher: "ASB", time: "06:30 PM -08:30 PM", status: "NOT_MARKED" },
];

const teacherActivities: TeacherActivity[] = [
  { id: "1", topic: "Calculus", subject: "Math", batch: "26TJMA1", date: "12/10/2025, 1:30:00 PM", status: "IN_PROGRESS", description: "Sub-Topic: LPP Details: started test the one with no real sub topic" },
  { id: "2", topic: "Continuity", subject: "Math", batch: "27KJ1", date: "12/2/2025, 4:30:00 PM", status: "COMPLETED", description: "xyz" },
  { id: "3", topic: "Quadratic Equations", subject: "Math", batch: "27KJ1", date: "12/2/2025, 4:30:00 PM", status: "IN_PROGRESS", description: "abcd" },
  { id: "4", topic: "Applications of Derivatives", subject: "Math", batch: "26TJMA1", date: "11/10/2025, 1:30:00 PM", status: "COMPLETED", description: "is not completely completed" },
];

const Attendance = () => {
  const [activeTab, setActiveTab] = useState("schedule");

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

      {activeTab === "schedule" && <ScheduleTab />}
      {activeTab === "reports" && <ReportsTab activities={teacherActivities} />}
      {activeTab === "student-report" && <StudentReportTab records={attendanceRecords} />}
    </div>
  );
};

const ScheduleTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Select Branch</label>
            <Select defaultValue="kalyan">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kalyan">Kalyan Branch</SelectItem>
                <SelectItem value="thane">Thane HO Branch</SelectItem>
                <SelectItem value="palava">Palava Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Filter by Batch (Optional)</label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches in Branch</SelectItem>
                <SelectItem value="27kj1">27KJ1</SelectItem>
                <SelectItem value="27kj2">27KJ2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Select a day in week</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input type="date" defaultValue="2025-12-12" className="flex-1" />
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {Object.entries(sessionsData).map(([date, sessions]) => (
        <div key={date} className="space-y-4">
          <h2 className="text-lg font-semibold">{date}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-primary">
                        {session.code} - {session.subject}
                      </h3>
                      <p className="text-sm text-muted-foreground">By {session.teacher}</p>
                      <p className="text-sm text-muted-foreground">{session.time}</p>
                      <p className="text-sm text-muted-foreground">{session.classroom || "No classroom"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-2">
                        <CheckSquare className="h-4 w-4" />
                        Attendance
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-2">
                        <Edit className="h-4 w-4" />
                        Remarks
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ReportsTab = ({ activities }: { activities: TeacherActivity[] }) => {
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
            <Select defaultValue="rcm">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rcm">RCM</SelectItem>
                <SelectItem value="asm">ASM</SelectItem>
                <SelectItem value="zap">ZAP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="border-b border-border pb-3 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{activity.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.subject} • {activity.batch}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                    <Badge variant={activity.status === "COMPLETED" ? "default" : "secondary"} className="mt-1">
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StudentReportTab = ({ records }: { records: AttendanceRecord[] }) => {
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
              <label className="mb-1.5 block text-sm font-medium">Select Student Admission</label>
              <Select defaultValue="student2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student2">Student 2 (JEE Foundation)</SelectItem>
                  <SelectItem value="student1">Student test 1 (NEET Foundation)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-32">
              <label className="mb-1.5 block text-sm font-medium">Month</label>
              <Select defaultValue="dec">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dec">Dec</SelectItem>
                  <SelectItem value="nov">Nov</SelectItem>
                  <SelectItem value="oct">Oct</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-32">
              <label className="mb-1.5 block text-sm font-medium">Year</label>
              <Input defaultValue="2025" />
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
          <span className="text-sm text-muted-foreground">{records.length} records found</span>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DATE</TableHead>
                  <TableHead>SUBJECT</TableHead>
                  <TableHead>BATCH</TableHead>
                  <TableHead>TEACHER</TableHead>
                  <TableHead>TIME</TableHead>
                  <TableHead className="text-right">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>{record.batch}</TableCell>
                    <TableCell>{record.teacher}</TableCell>
                    <TableCell className="text-primary">{record.time}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={record.status === "LATE" ? "destructive" : "secondary"}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {records.map((record, index) => (
              <div key={index} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{record.subject}</p>
                    <p className="text-sm text-muted-foreground">{record.date}</p>
                  </div>
                  <Badge variant={record.status === "LATE" ? "destructive" : "secondary"}>
                    {record.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Batch: </span>
                    {record.batch}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Teacher: </span>
                    {record.teacher}
                  </div>
                </div>
                <p className="text-sm text-primary">{record.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
