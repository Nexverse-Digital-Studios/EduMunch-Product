/**
 * My Timetable Page (Student View)
 * =================================
 * Personal timetable view for students
 */

import { useState } from "react";
import { Calendar, Clock, BookOpen, User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useModulePermissions } from "@/contexts/PermissionContext";

interface TimetableEntry {
  id: string;
  period: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  type: "class" | "break" | "lunch" | "free";
}

// Mock timetable data for student
const mockTimetable: { [key: string]: TimetableEntry[] } = {
  monday: [
    {
      id: "1",
      period: "Period 1",
      time: "08:30 - 09:15",
      subject: "Mathematics",
      teacher: "Mr. John Smith",
      room: "Room 101",
      type: "class",
    },
    {
      id: "2",
      period: "Period 2",
      time: "09:15 - 10:00",
      subject: "Physics",
      teacher: "Dr. Sarah Lee",
      room: "Physics Lab",
      type: "class",
    },
    {
      id: "3",
      period: "Break",
      time: "10:00 - 10:15",
      subject: "Short Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      period: "Period 3",
      time: "10:15 - 11:00",
      subject: "Chemistry",
      teacher: "Mr. Robert Brown",
      room: "Chemistry Lab",
      type: "class",
    },
    {
      id: "5",
      period: "Period 4",
      time: "11:00 - 11:45",
      subject: "English",
      teacher: "Mrs. Emily Davis",
      room: "Room 102",
      type: "class",
    },
    {
      id: "6",
      period: "Lunch",
      time: "11:45 - 12:30",
      subject: "Lunch Break",
      teacher: "",
      room: "",
      type: "lunch",
    },
    {
      id: "7",
      period: "Period 5",
      time: "12:30 - 13:15",
      subject: "Biology",
      teacher: "Dr. Anna Taylor",
      room: "Biology Lab",
      type: "class",
    },
    {
      id: "8",
      period: "Period 6",
      time: "13:15 - 14:00",
      subject: "History",
      teacher: "Mr. Michael Wilson",
      room: "Room 103",
      type: "class",
    },
  ],
  tuesday: [
    {
      id: "1",
      period: "Period 1",
      time: "08:30 - 09:15",
      subject: "English",
      teacher: "Mrs. Emily Davis",
      room: "Room 102",
      type: "class",
    },
    {
      id: "2",
      period: "Period 2",
      time: "09:15 - 10:00",
      subject: "Mathematics",
      teacher: "Mr. John Smith",
      room: "Room 101",
      type: "class",
    },
    {
      id: "3",
      period: "Break",
      time: "10:00 - 10:15",
      subject: "Short Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      period: "Period 3",
      time: "10:15 - 11:00",
      subject: "Physics Practical",
      teacher: "Dr. Sarah Lee",
      room: "Physics Lab",
      type: "class",
    },
    {
      id: "5",
      period: "Period 4",
      time: "11:00 - 11:45",
      subject: "Physics Practical",
      teacher: "Dr. Sarah Lee",
      room: "Physics Lab",
      type: "class",
    },
    {
      id: "6",
      period: "Lunch",
      time: "11:45 - 12:30",
      subject: "Lunch Break",
      teacher: "",
      room: "",
      type: "lunch",
    },
    {
      id: "7",
      period: "Period 5",
      time: "12:30 - 13:15",
      subject: "Chemistry",
      teacher: "Mr. Robert Brown",
      room: "Chemistry Lab",
      type: "class",
    },
    {
      id: "8",
      period: "Period 6",
      time: "13:15 - 14:00",
      subject: "Free Period",
      teacher: "",
      room: "",
      type: "free",
    },
  ],
  wednesday: [
    {
      id: "1",
      period: "Period 1",
      time: "08:30 - 09:15",
      subject: "Biology",
      teacher: "Dr. Anna Taylor",
      room: "Biology Lab",
      type: "class",
    },
    {
      id: "2",
      period: "Period 2",
      time: "09:15 - 10:00",
      subject: "Chemistry",
      teacher: "Mr. Robert Brown",
      room: "Chemistry Lab",
      type: "class",
    },
    {
      id: "3",
      period: "Break",
      time: "10:00 - 10:15",
      subject: "Short Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      period: "Period 3",
      time: "10:15 - 11:00",
      subject: "Mathematics",
      teacher: "Mr. John Smith",
      room: "Room 101",
      type: "class",
    },
    {
      id: "5",
      period: "Period 4",
      time: "11:00 - 11:45",
      subject: "Physics",
      teacher: "Dr. Sarah Lee",
      room: "Physics Lab",
      type: "class",
    },
    {
      id: "6",
      period: "Lunch",
      time: "11:45 - 12:30",
      subject: "Lunch Break",
      teacher: "",
      room: "",
      type: "lunch",
    },
    {
      id: "7",
      period: "Period 5",
      time: "12:30 - 13:15",
      subject: "English",
      teacher: "Mrs. Emily Davis",
      room: "Room 102",
      type: "class",
    },
    {
      id: "8",
      period: "Period 6",
      time: "13:15 - 14:00",
      subject: "History",
      teacher: "Mr. Michael Wilson",
      room: "Room 103",
      type: "class",
    },
  ],
  thursday: [
    {
      id: "1",
      period: "Period 1",
      time: "08:30 - 09:15",
      subject: "Physics",
      teacher: "Dr. Sarah Lee",
      room: "Physics Lab",
      type: "class",
    },
    {
      id: "2",
      period: "Period 2",
      time: "09:15 - 10:00",
      subject: "Biology Practical",
      teacher: "Dr. Anna Taylor",
      room: "Biology Lab",
      type: "class",
    },
    {
      id: "3",
      period: "Break",
      time: "10:00 - 10:15",
      subject: "Short Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      period: "Period 3",
      time: "10:15 - 11:00",
      subject: "Biology Practical",
      teacher: "Dr. Anna Taylor",
      room: "Biology Lab",
      type: "class",
    },
    {
      id: "5",
      period: "Period 4",
      time: "11:00 - 11:45",
      subject: "Mathematics",
      teacher: "Mr. John Smith",
      room: "Room 101",
      type: "class",
    },
    {
      id: "6",
      period: "Lunch",
      time: "11:45 - 12:30",
      subject: "Lunch Break",
      teacher: "",
      room: "",
      type: "lunch",
    },
    {
      id: "7",
      period: "Period 5",
      time: "12:30 - 13:15",
      subject: "Chemistry Practical",
      teacher: "Mr. Robert Brown",
      room: "Chemistry Lab",
      type: "class",
    },
    {
      id: "8",
      period: "Period 6",
      time: "13:15 - 14:00",
      subject: "Chemistry Practical",
      teacher: "Mr. Robert Brown",
      room: "Chemistry Lab",
      type: "class",
    },
  ],
  friday: [
    {
      id: "1",
      period: "Period 1",
      time: "08:30 - 09:15",
      subject: "English",
      teacher: "Mrs. Emily Davis",
      room: "Room 102",
      type: "class",
    },
    {
      id: "2",
      period: "Period 2",
      time: "09:15 - 10:00",
      subject: "History",
      teacher: "Mr. Michael Wilson",
      room: "Room 103",
      type: "class",
    },
    {
      id: "3",
      period: "Break",
      time: "10:00 - 10:15",
      subject: "Short Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      period: "Period 3",
      time: "10:15 - 11:00",
      subject: "Mathematics",
      teacher: "Mr. John Smith",
      room: "Room 101",
      type: "class",
    },
    {
      id: "5",
      period: "Period 4",
      time: "11:00 - 11:45",
      subject: "Physics",
      teacher: "Dr. Sarah Lee",
      room: "Physics Lab",
      type: "class",
    },
    {
      id: "6",
      period: "Lunch",
      time: "11:45 - 12:30",
      subject: "Lunch Break",
      teacher: "",
      room: "",
      type: "lunch",
    },
    {
      id: "7",
      period: "Period 5",
      time: "12:30 - 13:15",
      subject: "Biology",
      teacher: "Dr. Anna Taylor",
      room: "Biology Lab",
      type: "class",
    },
    {
      id: "8",
      period: "Period 6",
      time: "13:15 - 14:00",
      subject: "Free Period",
      teacher: "",
      room: "",
      type: "free",
    },
  ],
  saturday: [
    {
      id: "1",
      period: "Period 1",
      time: "08:30 - 09:15",
      subject: "Extra Class - Mathematics",
      teacher: "Mr. John Smith",
      room: "Room 101",
      type: "class",
    },
    {
      id: "2",
      period: "Period 2",
      time: "09:15 - 10:00",
      subject: "Extra Class - Physics",
      teacher: "Dr. Sarah Lee",
      room: "Physics Lab",
      type: "class",
    },
    {
      id: "3",
      period: "Break",
      time: "10:00 - 10:15",
      subject: "Short Break",
      teacher: "",
      room: "",
      type: "break",
    },
    {
      id: "4",
      period: "Period 3",
      time: "10:15 - 11:00",
      subject: "Extra Class - Chemistry",
      teacher: "Mr. Robert Brown",
      room: "Chemistry Lab",
      type: "class",
    },
  ],
};

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

const MyTimetablePage = () => {
  const { user } = useAuth();
  const { canView } = useModulePermissions("timetable");

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const [selectedDay, setSelectedDay] = useState(
    today === "sunday" ? "monday" : today
  );

  const getEntryStyle = (type: string) => {
    switch (type) {
      case "class":
        return "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30";
      case "break":
        return "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30";
      case "lunch":
        return "border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/30";
      case "free":
        return "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/30";
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

  const todaySchedule = mockTimetable[selectedDay] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Timetable</h1>
        <p className="text-muted-foreground">
          Your personal class schedule for the week
        </p>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="font-semibold">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Classes Today</p>
                <p className="font-semibold">
                  {mockTimetable[today]?.filter((e) => e.type === "class")
                    .length || 0}{" "}
                  Classes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Next Class</p>
                <p className="font-semibold">
                  {mockTimetable[today]?.[0]?.subject || "No classes"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDay} onValueChange={setSelectedDay}>
            <TabsList className="grid grid-cols-6 w-full">
              {DAYS.map((day) => (
                <TabsTrigger
                  key={day.value}
                  value={day.value}
                  className={
                    day.value === today ? "border-b-2 border-primary" : ""
                  }
                >
                  {day.label.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>

            {DAYS.map((day) => (
              <TabsContent key={day.value} value={day.value} className="mt-4">
                <div className="space-y-3">
                  {(mockTimetable[day.value] || []).map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg ${getEntryStyle(entry.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{entry.period}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {entry.time}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg">
                            {entry.subject}
                          </h3>
                          {entry.type === "class" && (
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {entry.teacher}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {entry.room}
                              </div>
                            </div>
                          )}
                        </div>
                        {entry.type === "class" && <Badge>Class</Badge>}
                        {entry.type === "break" && (
                          <Badge variant="secondary">Break</Badge>
                        )}
                        {entry.type === "lunch" && (
                          <Badge variant="outline">Lunch</Badge>
                        )}
                        {entry.type === "free" && (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyTimetablePage;
