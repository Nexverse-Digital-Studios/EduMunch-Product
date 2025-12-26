/**
 * Substitute Teacher Page
 * ========================
 * Assign substitute teachers for absent teachers
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  ArrowLeft,
  Search,
  Calendar,
  User,
  Clock,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

interface TeacherDB {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  status: string;
}

interface ScheduledClass {
  id: string;
  section: string;
  subject: string;
  period: string;
  time: string;
  room: string;
  substituteAssigned?: string;
}

// Mock data for absent teachers and their classes
const mockAbsentTeachers = [
  {
    id: "1",
    name: "Mr. John Smith",
    employeeCode: "EMP001",
    reason: "Medical Leave",
    date: "2025-12-26",
    classes: [
      {
        id: "c1",
        section: "Class 10-A",
        subject: "Mathematics",
        period: "Period 1",
        time: "09:00 - 10:00",
        room: "Room 101",
      },
      {
        id: "c2",
        section: "Class 9-B",
        subject: "Mathematics",
        period: "Period 3",
        time: "11:00 - 12:00",
        room: "Room 203",
      },
    ],
  },
  {
    id: "2",
    name: "Dr. Sarah Lee",
    employeeCode: "EMP002",
    reason: "Personal Leave",
    date: "2025-12-26",
    classes: [
      {
        id: "c3",
        section: "Class 11-A",
        subject: "Physics",
        period: "Period 2",
        time: "10:00 - 11:00",
        room: "Physics Lab",
      },
    ],
  },
];

const SubstitutePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canUpdate } = useModulePermissions("timetable");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(
    null
  );
  const [selectedAbsentTeacher, setSelectedAbsentTeacher] =
    useState<string>("");
  const [selectedSubstitute, setSelectedSubstitute] = useState("");

  // Fetch available teachers
  const { data: teachersData } = useSupabaseTable<TeacherDB>(TABLES.TEACHERS, {
    filters: { status: "active" },
    orderBy: { column: "first_name", ascending: true },
  });

  const teachers = teachersData || [];

  // Filter absent teachers based on search
  const filteredAbsentTeachers = mockAbsentTeachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignSubstitute = () => {
    if (!selectedSubstitute) {
      toast({
        title: "Error",
        description: "Please select a substitute teacher",
        variant: "destructive",
      });
      return;
    }

    const substituteTeacher = teachers.find((t) => t.id === selectedSubstitute);

    toast({
      title: "Substitute Assigned",
      description: `${substituteTeacher?.first_name} ${substituteTeacher?.last_name} has been assigned as substitute`,
    });

    setShowAssignDialog(false);
    setSelectedClass(null);
    setSelectedSubstitute("");
  };

  if (!canUpdate) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to assign substitutes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Substitute Teacher Assignment
            </h1>
            <p className="text-muted-foreground">
              Assign substitute teachers for absent staff
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label>Search Teacher</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Absent Teachers List */}
      <div className="space-y-4">
        {filteredAbsentTeachers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCheck className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">No Absent Teachers</h3>
              <p className="text-muted-foreground">
                All teachers are present for the selected date.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAbsentTeachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{teacher.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {teacher.employeeCode}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{teacher.reason}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-3">
                  Classes Needing Coverage:
                </p>
                <div className="grid gap-3">
                  {teacher.classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{cls.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {cls.section} - {cls.subject}
                          </span>
                        </div>
                        <Badge variant="outline">{cls.period}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {cls.room}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedClass(cls);
                          setSelectedAbsentTeacher(teacher.name);
                          setShowAssignDialog(true);
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Assign Substitute
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assign Substitute Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Substitute Teacher</DialogTitle>
            <DialogDescription>
              Select a teacher to cover this class.
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="font-medium">Class Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Absent Teacher:
                    </span>
                    <span className="ml-2">{selectedAbsentTeacher}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Section:</span>
                    <span className="ml-2">{selectedClass.section}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="ml-2">{selectedClass.subject}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <span className="ml-2">{selectedClass.time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Substitute Teacher</Label>
                <Select
                  value={selectedSubstitute}
                  onValueChange={setSelectedSubstitute}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name} (
                        {teacher.employee_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignSubstitute}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubstitutePage;
