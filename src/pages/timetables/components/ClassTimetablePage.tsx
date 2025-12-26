/**
 * Class Timetable Page (Public View)
 * ====================================
 * View timetable for a specific class - accessible to students
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

interface ClassDB {
  id: string;
  class_name: string;
  class_code: string;
}

interface SectionDB {
  id: string;
  section_name: string;
  section_code: string;
  class_id: string;
}

interface TimetableEntry {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  type: "class" | "break" | "lunch";
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Mock weekly timetable for a class
const mockClassTimetable: { [key: string]: TimetableEntry[] } = {
  monday: [
    {
      id: "1",
      time: "08:30",
      subject: "Mathematics",
      teacher: "Mr. John Smith",
      room: "101",
      type: "class",
    },
    {
      id: "2",
      time: "09:15",
      subject: "Physics",
      teacher: "Dr. Sarah Lee",
      room: "Lab 1",
      type: "class",
    },
    {
      id: "3",
      time: "10:00",
      subject: "Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      time: "10:15",
      subject: "Chemistry",
      teacher: "Mr. Robert Brown",
      room: "Lab 2",
      type: "class",
    },
    {
      id: "5",
      time: "11:00",
      subject: "English",
      teacher: "Mrs. Emily Davis",
      room: "102",
      type: "class",
    },
    {
      id: "6",
      time: "11:45",
      subject: "Lunch",
      teacher: "",
      room: "",
      type: "lunch",
    },
    {
      id: "7",
      time: "12:30",
      subject: "Biology",
      teacher: "Dr. Anna Taylor",
      room: "Lab 3",
      type: "class",
    },
    {
      id: "8",
      time: "13:15",
      subject: "History",
      teacher: "Mr. Michael Wilson",
      room: "103",
      type: "class",
    },
  ],
  tuesday: [
    {
      id: "1",
      time: "08:30",
      subject: "English",
      teacher: "Mrs. Emily Davis",
      room: "102",
      type: "class",
    },
    {
      id: "2",
      time: "09:15",
      subject: "Mathematics",
      teacher: "Mr. John Smith",
      room: "101",
      type: "class",
    },
    {
      id: "3",
      time: "10:00",
      subject: "Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      time: "10:15",
      subject: "Physics Practical",
      teacher: "Dr. Sarah Lee",
      room: "Lab 1",
      type: "class",
    },
    {
      id: "5",
      time: "11:00",
      subject: "Physics Practical",
      teacher: "Dr. Sarah Lee",
      room: "Lab 1",
      type: "class",
    },
    {
      id: "6",
      time: "11:45",
      subject: "Lunch",
      teacher: "",
      room: "",
      type: "lunch",
    },
    {
      id: "7",
      time: "12:30",
      subject: "Chemistry",
      teacher: "Mr. Robert Brown",
      room: "Lab 2",
      type: "class",
    },
    {
      id: "8",
      time: "13:15",
      subject: "Sports",
      teacher: "Coach Williams",
      room: "Ground",
      type: "class",
    },
  ],
  wednesday: [
    {
      id: "1",
      time: "08:30",
      subject: "Biology",
      teacher: "Dr. Anna Taylor",
      room: "Lab 3",
      type: "class",
    },
    {
      id: "2",
      time: "09:15",
      subject: "Chemistry",
      teacher: "Mr. Robert Brown",
      room: "Lab 2",
      type: "class",
    },
    {
      id: "3",
      time: "10:00",
      subject: "Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      time: "10:15",
      subject: "Mathematics",
      teacher: "Mr. John Smith",
      room: "101",
      type: "class",
    },
    {
      id: "5",
      time: "11:00",
      subject: "Physics",
      teacher: "Dr. Sarah Lee",
      room: "Lab 1",
      type: "class",
    },
    {
      id: "6",
      time: "11:45",
      subject: "Lunch",
      teacher: "",
      room: "",
      type: "lunch",
    },
    {
      id: "7",
      time: "12:30",
      subject: "English",
      teacher: "Mrs. Emily Davis",
      room: "102",
      type: "class",
    },
    {
      id: "8",
      time: "13:15",
      subject: "Geography",
      teacher: "Ms. Lisa Chen",
      room: "104",
      type: "class",
    },
  ],
  thursday: [
    {
      id: "1",
      time: "08:30",
      subject: "Physics",
      teacher: "Dr. Sarah Lee",
      room: "Lab 1",
      type: "class",
    },
    {
      id: "2",
      time: "09:15",
      subject: "Biology Practical",
      teacher: "Dr. Anna Taylor",
      room: "Lab 3",
      type: "class",
    },
    {
      id: "3",
      time: "10:00",
      subject: "Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      time: "10:15",
      subject: "Biology Practical",
      teacher: "Dr. Anna Taylor",
      room: "Lab 3",
      type: "class",
    },
    {
      id: "5",
      time: "11:00",
      subject: "Mathematics",
      teacher: "Mr. John Smith",
      room: "101",
      type: "class",
    },
    {
      id: "6",
      time: "11:45",
      subject: "Lunch",
      teacher: "",
      room: "",
      type: "lunch",
    },
    {
      id: "7",
      time: "12:30",
      subject: "Chemistry Practical",
      teacher: "Mr. Robert Brown",
      room: "Lab 2",
      type: "class",
    },
    {
      id: "8",
      time: "13:15",
      subject: "Chemistry Practical",
      teacher: "Mr. Robert Brown",
      room: "Lab 2",
      type: "class",
    },
  ],
  friday: [
    {
      id: "1",
      time: "08:30",
      subject: "English",
      teacher: "Mrs. Emily Davis",
      room: "102",
      type: "class",
    },
    {
      id: "2",
      time: "09:15",
      subject: "History",
      teacher: "Mr. Michael Wilson",
      room: "103",
      type: "class",
    },
    {
      id: "3",
      time: "10:00",
      subject: "Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      time: "10:15",
      subject: "Mathematics",
      teacher: "Mr. John Smith",
      room: "101",
      type: "class",
    },
    {
      id: "5",
      time: "11:00",
      subject: "Physics",
      teacher: "Dr. Sarah Lee",
      room: "Lab 1",
      type: "class",
    },
    {
      id: "6",
      time: "11:45",
      subject: "Lunch",
      teacher: "",
      room: "",
      type: "lunch",
    },
    {
      id: "7",
      time: "12:30",
      subject: "Biology",
      teacher: "Dr. Anna Taylor",
      room: "Lab 3",
      type: "class",
    },
    {
      id: "8",
      time: "13:15",
      subject: "Art/Music",
      teacher: "Various",
      room: "105",
      type: "class",
    },
  ],
  saturday: [
    {
      id: "1",
      time: "08:30",
      subject: "Extra - Mathematics",
      teacher: "Mr. John Smith",
      room: "101",
      type: "class",
    },
    {
      id: "2",
      time: "09:15",
      subject: "Extra - Physics",
      teacher: "Dr. Sarah Lee",
      room: "Lab 1",
      type: "class",
    },
    {
      id: "3",
      time: "10:00",
      subject: "Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      time: "10:15",
      subject: "Extra - Chemistry",
      teacher: "Mr. Robert Brown",
      room: "Lab 2",
      type: "class",
    },
  ],
};

const ClassTimetablePage = () => {
  const navigate = useNavigate();
  const { canView } = useModulePermissions("timetable");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Fetch classes
  const { data: classesData } = useSupabaseTable<ClassDB>(TABLES.CLASSES, {
    orderBy: { column: "class_name", ascending: true },
  });

  // Fetch sections
  const { data: sectionsData } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    orderBy: { column: "section_name", ascending: true },
  });

  const classes = classesData || [];
  const sections = sectionsData || [];

  const filteredSections = selectedClass
    ? sections.filter((s) => s.class_id === selectedClass)
    : [];

  const getClassName = () => {
    const cls = classes.find((c) => c.id === selectedClass);
    const sec = sections.find((s) => s.id === selectedSection);
    if (cls && sec) {
      return `${cls.class_name} - ${sec.section_name}`;
    }
    return "Select a class";
  };

  const getCellStyle = (type: string) => {
    switch (type) {
      case "class":
        return "bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100";
      case "break":
        return "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-100";
      case "lunch":
        return "bg-orange-50 dark:bg-orange-950/30 text-orange-900 dark:text-orange-100";
      default:
        return "";
    }
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to view timetables.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Timetable</h1>
          <p className="text-muted-foreground">
            View weekly schedule for any class
          </p>
        </div>
      </div>

      {/* Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Select Class</label>
              <Select
                value={selectedClass}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  setSelectedSection("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Select Section</label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedClass ? "Choose a section" : "Select class first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredSections.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>
                      {sec.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      {selectedSection ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {getClassName()} - Weekly Timetable
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                <div className="p-2 font-semibold text-center bg-muted rounded-lg">
                  Time
                </div>
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="p-2 font-semibold text-center bg-muted rounded-lg"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {mockClassTimetable.monday.map((slot, idx) => (
                <div key={idx} className="grid grid-cols-7 gap-2 mb-2">
                  <div className="p-2 text-center bg-muted/50 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {slot.time}
                  </div>
                  {DAYS.map((day) => {
                    const dayKey = day.toLowerCase();
                    const entry = mockClassTimetable[dayKey]?.[idx];
                    if (!entry) {
                      return (
                        <div
                          key={day}
                          className="p-2 rounded-lg bg-muted/30 text-center text-muted-foreground"
                        >
                          -
                        </div>
                      );
                    }
                    return (
                      <div
                        key={day}
                        className={`p-2 rounded-lg ${getCellStyle(entry.type)}`}
                      >
                        <p className="font-medium text-sm">{entry.subject}</p>
                        {entry.type === "class" && (
                          <>
                            <p className="text-xs opacity-75 flex items-center gap-1 mt-1">
                              <User className="h-3 w-3" />
                              {entry.teacher}
                            </p>
                            <p className="text-xs opacity-75 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {entry.room}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Select a Class</h3>
            <p className="text-muted-foreground">
              Choose a class and section to view the timetable
            </p>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      {selectedSection && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm">Regular Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span className="text-sm">Short Break</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500"></div>
                <span className="text-sm">Lunch Break</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassTimetablePage;
