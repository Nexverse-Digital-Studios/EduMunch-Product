/**
 * AvailabilitySlots.tsx - Weekly Schedule & Online Class Management
 * 
 * Supabase Tables (Tier 2):
 * - online_class_sessions_1EMAET: Scheduled online classes
 * - teachers_1EMAET: Teacher information
 * - sections_1EMAET: Section information
 * - subjects_1EMAET: Subject information
 * 
 * Schema Reference:
 * - session_title, section_id, subject_id, teacher_id
 * - session_date, start_time, end_time
 * - platform (Zoom/Google Meet/Microsoft Teams/Other), meeting_link
 * - status (Scheduled/Live/Completed/Cancelled)
 */
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, X, RefreshCw, Download, BookOpen, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from "date-fns";

interface OnlineClassSession {
  id: string;
  session_title: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  platform: string;
  meeting_link: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  subjects_1EMAET?: { name: string };
  teachers_1EMAET?: { first_name: string; last_name: string; teacher_code: string };
  sections_1EMAET?: { name: string };
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  teacher_code: string;
}

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1EMAET';

const AvailabilitySlots = () => {
  const [activeTab, setActiveTab] = useState("branch");
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { canRead, canCreate, canUpdate } = useModulePermissions('LMS');

  // Fetch branches
  const { data: branches = [] } = useSupabaseQuery<Branch>(
    `branches_${INDEX_TOKEN}`,
    { select: 'id, name, code', orderBy: { column: 'name', ascending: true } }
  );

  // Fetch teachers
  const { data: teachers = [] } = useSupabaseQuery<Teacher>(
    `teachers_${INDEX_TOKEN}`,
    { select: 'id, first_name, last_name, teacher_code', orderBy: { column: 'first_name', ascending: true } }
  );

  // Fetch online class sessions with joins
  const { data: sessions = [], isLoading, error, refetch } = useSupabaseQuery<OnlineClassSession>(
    `online_class_sessions_${INDEX_TOKEN}`,
    { 
      select: `*, subjects_${INDEX_TOKEN}(name), teachers_${INDEX_TOKEN}(first_name, last_name, teacher_code), sections_${INDEX_TOKEN}(name)`,
      orderBy: { column: 'session_date', ascending: true }
    }
  );

  // Calculate week days
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  // Filter sessions by week and other filters
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.session_date);
      const inWeek = sessionDate >= currentWeekStart && sessionDate <= weekEnd;
      
      const matchesSearch = searchQuery === "" || 
        session.session_title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || session.status === statusFilter;
      
      const matchesTeacher = selectedTeacherId === "" || session.teacher_id === selectedTeacherId;
      
      return inWeek && matchesSearch && matchesStatus && matchesTeacher;
    });
  }, [sessions, currentWeekStart, weekEnd, searchQuery, statusFilter, selectedTeacherId]);

  // Group sessions by day
  const sessionsByDay = useMemo(() => {
    const grouped: Record<string, OnlineClassSession[]> = {};
    weekDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      grouped[dateKey] = filteredSessions.filter(session => 
        isSameDay(new Date(session.session_date), day)
      );
    });
    return grouped;
  }, [filteredSessions, weekDays]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => 
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Live':
        return <Badge className="bg-red-500 animate-pulse">Live</Badge>;
      case 'Completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Scheduled</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
        Weekly Schedule (UTC)
      </h1>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load sessions: {error.message}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="branch" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            All Sessions ({sessions.length})
          </TabsTrigger>
          <TabsTrigger 
            value="teacher"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            By Teacher
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branch" className="mt-6">
          <div className="space-y-6">
            {/* Navigation & Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {format(currentWeekStart, 'MMM d, yyyy')} - {format(weekEnd, 'MMM d, yyyy')}
                </span>
                <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Input 
                  placeholder="Search sessions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-[200px]"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Live">Live</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Week Grid */}
            <div className="space-y-4">
              {weekDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const daySessions = sessionsByDay[dateKey] || [];
                
                return (
                  <Card key={dateKey}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="bg-muted rounded-lg p-4 text-center min-w-[120px]">
                          <p className="font-semibold">{format(day, 'EEEE')}</p>
                          <p className="text-sm text-muted-foreground">{format(day, 'MMM d')}</p>
                          {canCreate && (
                            <Button size="sm" className="mt-2 gap-1">
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          )}
                        </div>
                        <div className="flex-1">
                          {daySessions.length === 0 ? (
                            <p className="text-muted-foreground py-4">No sessions scheduled.</p>
                          ) : (
                            <div className="space-y-2">
                              {daySessions.map((session) => {
                                const teacher = session[`teachers_${INDEX_TOKEN}`];
                                const subject = session[`subjects_${INDEX_TOKEN}`];
                                const section = session[`sections_${INDEX_TOKEN}`];
                                
                                return (
                                  <div key={session.id} className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                      <BookOpen className="h-5 w-5 text-primary" />
                                      <div>
                                        <p className="font-medium">{session.session_title}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {subject?.name} • {section?.name} • {teacher ? `${teacher.first_name} ${teacher.last_name}` : 'TBD'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {session.start_time} - {session.end_time} ({session.platform})
                                        </p>
                                      </div>
                                    </div>
                                    {getStatusBadge(session.status)}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teacher" className="mt-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex-1 max-w-md">
                <label className="mb-1.5 block text-sm font-medium">Select Teacher</label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Teachers</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name} ({teacher.teacher_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {format(currentWeekStart, 'MMM d, yyyy')} - {format(weekEnd, 'MMM d, yyyy')}
                </span>
                <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week Grid for selected teacher */}
            <div className="space-y-4">
              {weekDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const daySessions = sessionsByDay[dateKey] || [];
                
                return (
                  <Card key={dateKey}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="bg-muted rounded-lg p-4 text-center min-w-[120px]">
                          <p className="font-semibold">{format(day, 'EEEE')}</p>
                          <p className="text-sm text-muted-foreground">{format(day, 'MMM d')}</p>
                        </div>
                        <div className="flex-1">
                          {daySessions.length === 0 ? (
                            <p className="text-muted-foreground">No sessions scheduled.</p>
                          ) : (
                            <div className="space-y-2">
                              {daySessions.map((session) => {
                                const subject = session[`subjects_${INDEX_TOKEN}`];
                                const section = session[`sections_${INDEX_TOKEN}`];
                                
                                return (
                                  <div key={session.id} className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <BookOpen className="h-5 w-5 text-primary" />
                                      <div>
                                        <p className="font-medium">{session.session_title}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {subject?.name} • {section?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {session.start_time} - {session.end_time}
                                        </p>
                                      </div>
                                    </div>
                                    {getStatusBadge(session.status)}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Showing {filteredSessions.length} session(s) for the selected week
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AvailabilitySlots;
