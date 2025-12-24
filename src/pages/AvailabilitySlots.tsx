import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, RefreshCw, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScheduleEvent {
  id: string;
  title: string;
  batch: string;
  time: string;
}

interface DaySchedule {
  day: string;
  date: string;
  events: ScheduleEvent[];
}

const branchSchedule: DaySchedule[] = [
  { day: "Monday", date: "Dec 8", events: [] },
  { day: "Tuesday", date: "Dec 9", events: [] },
  { day: "Wednesday", date: "Dec 10", events: [] },
  { day: "Thursday", date: "Dec 11", events: [] },
  { day: "Friday", date: "Dec 12", events: [] },
  { day: "Saturday", date: "Dec 13", events: [] },
  { day: "Sunday", date: "Dec 14", events: [] },
];

const teacherSchedule: DaySchedule[] = [
  { day: "Monday", date: "Dec 1", events: [] },
  { day: "Tuesday", date: "Dec 2", events: [
    { id: "1", title: "Math - 27KJ1", batch: "27KJ1", time: "11:00 - 13:00 (UTC)" }
  ] },
  { day: "Wednesday", date: "Dec 3", events: [] },
  { day: "Thursday", date: "Dec 4", events: [] },
  { day: "Friday", date: "Dec 5", events: [] },
  { day: "Saturday", date: "Dec 6", events: [] },
  { day: "Sunday", date: "Dec 7", events: [] },
];

const AvailabilitySlots = () => {
  const [activeTab, setActiveTab] = useState("branch");
  const [dateRange, setDateRange] = useState("Dec 8, 2025 - Dec 14, 2025");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
        Weekly Schedule (UTC)
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="branch" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Branch Availability
          </TabsTrigger>
          <TabsTrigger 
            value="teacher"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Teacher Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branch" className="mt-6">
          <BranchAvailabilityTab schedule={branchSchedule} />
        </TabsContent>

        <TabsContent value="teacher" className="mt-6">
          <TeacherScheduleTab schedule={teacherSchedule} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BranchAvailabilityTab = ({ schedule }: { schedule: DaySchedule[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium">Select Branch</label>
          <Select defaultValue="kalyan">
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kalyan">Kalyan Branch</SelectItem>
              <SelectItem value="thane">Thane HO Branch</SelectItem>
              <SelectItem value="palava">Palava Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[180px] text-center">Dec 8, 2025 - Dec 14, 2025</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <FiltersSection />

      <div className="space-y-4">
        {schedule.map((day) => (
          <Card key={day.day}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="bg-muted rounded-lg p-4 text-center min-w-[120px]">
                  <p className="font-semibold">{day.day}</p>
                  <p className="text-sm text-muted-foreground">{day.date}</p>
                  <Button size="sm" className="mt-2 gap-1">
                    <Plus className="h-3 w-3" />
                    Add Slot
                  </Button>
                </div>
                <div className="flex-1">
                  {day.events.length === 0 ? (
                    <p className="text-muted-foreground">No events scheduled.</p>
                  ) : (
                    <div className="space-y-2">
                      {day.events.map((event) => (
                        <div key={event.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const TeacherScheduleTab = ({ schedule }: { schedule: DaySchedule[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium">Select Teacher</label>
          <Select defaultValue="rcm">
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rcm">RCM</SelectItem>
              <SelectItem value="asm">ASM</SelectItem>
              <SelectItem value="zap">ZAP</SelectItem>
              <SelectItem value="mnp">MNP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[180px] text-center">Dec 1, 2025 - Dec 7, 2025</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <FiltersSection showingResults={1} />

      <div className="space-y-4">
        {schedule.map((day) => (
          <Card key={day.day}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="bg-muted rounded-lg p-4 text-center min-w-[120px]">
                  <p className="font-semibold">{day.day}</p>
                  <p className="text-sm text-muted-foreground">{day.date}</p>
                </div>
                <div className="flex-1">
                  {day.events.length === 0 ? (
                    <p className="text-muted-foreground">No events scheduled.</p>
                  ) : (
                    <div className="space-y-2">
                      {day.events.map((event) => (
                        <div key={event.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const FiltersSection = ({ showingResults = 0 }: { showingResults?: number }) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Search (title / teacher)</label>
          <Input placeholder="Search..." />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Event Type</label>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="lecture">Lecture</SelectItem>
              <SelectItem value="lab">Lab</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Teacher (branch view)</label>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="rcm">RCM</SelectItem>
              <SelectItem value="asm">ASM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">From (UTC)</label>
          <Input type="date" placeholder="dd-mm-yyyy" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">To (UTC)</label>
          <Input type="date" placeholder="dd-mm-yyyy" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Sort</label>
          <Select defaultValue="newest">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Start Date (new → old)</SelectItem>
              <SelectItem value="oldest">Start Date (old → new)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reload Week
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Table
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          Showing <span className="text-primary font-medium">{showingResults}</span> results
        </span>
      </div>
    </div>
  );
};

export default AvailabilitySlots;
