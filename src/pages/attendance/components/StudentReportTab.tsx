import { useState } from "react";
import { FileText, User } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { StudentDB, AttendanceDB, SectionDB } from "./types";

interface StudentReportTabProps {
  students: StudentDB[];
  attendance: AttendanceDB[];
  sections: SectionDB[];
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "present":
      return "default";
    case "absent":
      return "destructive";
    default:
      return "secondary";
  }
};

export const StudentReportTab = ({
  students,
  attendance,
}: StudentReportTabProps) => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  const filteredRecords = selectedStudent
    ? attendance.filter((a) => a.student_id === selectedStudent)
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
              <label className="mb-1.5 block text-sm font-medium">
                Select Student
              </label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
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
          <span className="text-sm text-muted-foreground">
            {filteredRecords.length} records found
          </span>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {selectedStudent
                ? "No attendance records found for this student."
                : "Select a student to view their attendance."}
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
                        <TableCell>
                          {new Date(
                            record.attendance_date
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(record.status)}>
                            {record.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.remarks || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border border-border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium">
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </p>
                      <Badge variant={getStatusBadgeVariant(record.status)}>
                        {record.status.toUpperCase()}
                      </Badge>
                    </div>
                    {record.remarks && (
                      <p className="text-sm text-muted-foreground">
                        {record.remarks}
                      </p>
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
