/**
 * Online Classes Page - Virtual Classroom Management
 *
 * Features:
 * - Schedule and manage online classes
 * - Join live classes
 * - View recorded sessions
 * - Integration with video platforms
 *
 * Note: Currently using demo data. Full integration pending.
 */
import { useState } from "react";
import {
  Video,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Play,
  ExternalLink,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Monitor,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Share2,
  Download,
  Eye,
  CalendarDays,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, addHours, isAfter, isBefore, addMinutes } from "date-fns";

// Demo online classes
const demoClasses = [
  {
    id: 1,
    title: "Mathematics - Quadratic Equations",
    subject: "Mathematics",
    class: "10A",
    teacher: "Mr. Sharma",
    startTime: "2026-01-04T10:00:00",
    duration: 45,
    status: "live",
    platform: "Zoom",
    meetingId: "123-456-789",
    participants: 32,
    maxParticipants: 40,
    recordingAvailable: false,
  },
  {
    id: 2,
    title: "Physics - Laws of Motion",
    subject: "Physics",
    class: "11B",
    teacher: "Dr. Kumar",
    startTime: "2026-01-04T11:00:00",
    duration: 60,
    status: "scheduled",
    platform: "Google Meet",
    meetingId: "abc-defg-hij",
    participants: 0,
    maxParticipants: 35,
    recordingAvailable: false,
  },
  {
    id: 3,
    title: "English Literature - Shakespeare",
    subject: "English",
    class: "9C",
    teacher: "Ms. Johnson",
    startTime: "2026-01-04T14:00:00",
    duration: 45,
    status: "scheduled",
    platform: "Zoom",
    meetingId: "987-654-321",
    participants: 0,
    maxParticipants: 38,
    recordingAvailable: false,
  },
  {
    id: 4,
    title: "Chemistry - Periodic Table",
    subject: "Chemistry",
    class: "11A",
    teacher: "Mrs. Patel",
    startTime: "2026-01-03T10:00:00",
    duration: 50,
    status: "completed",
    platform: "Zoom",
    meetingId: "111-222-333",
    participants: 34,
    maxParticipants: 40,
    recordingAvailable: true,
  },
  {
    id: 5,
    title: "Biology - Cell Structure",
    subject: "Biology",
    class: "9A",
    teacher: "Dr. Verma",
    startTime: "2026-01-03T11:30:00",
    duration: 45,
    status: "completed",
    platform: "Google Meet",
    meetingId: "xyz-uvwx-rst",
    participants: 28,
    maxParticipants: 35,
    recordingAvailable: true,
  },
  {
    id: 6,
    title: "History - French Revolution",
    subject: "History",
    class: "8B",
    teacher: "Mr. Singh",
    startTime: "2026-01-03T14:00:00",
    duration: 40,
    status: "completed",
    platform: "Zoom",
    meetingId: "444-555-666",
    participants: 30,
    maxParticipants: 36,
    recordingAvailable: true,
  },
];

const statusColors: Record<string, string> = {
  live: "bg-red-100 text-red-700",
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const platformColors: Record<string, string> = {
  "Zoom": "bg-blue-500",
  "Google Meet": "bg-green-500",
  "Microsoft Teams": "bg-purple-500",
};

export const OnlineClassesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<typeof demoClasses[0] | null>(null);

  const now = new Date();
  
  const upcomingClasses = demoClasses.filter(c => c.status === "scheduled" || c.status === "live");
  const completedClasses = demoClasses.filter(c => c.status === "completed");
  const recordedClasses = demoClasses.filter(c => c.recordingAvailable);

  const filteredClasses = (activeTab === "upcoming" ? upcomingClasses : 
                          activeTab === "completed" ? completedClasses : recordedClasses)
    .filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacher.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    liveNow: demoClasses.filter(c => c.status === "live").length,
    todayClasses: demoClasses.filter(c => 
      format(new Date(c.startTime), "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
    ).length,
    totalRecordings: recordedClasses.length,
    totalParticipants: demoClasses.reduce((acc, c) => acc + c.participants, 0),
  };

  const handleSchedule = () => {
    toast({
      title: "Class scheduled",
      description: "Online class has been scheduled successfully.",
    });
    setIsScheduleOpen(false);
  };

  const handleJoin = (cls: typeof demoClasses[0]) => {
    setSelectedClass(cls);
    setIsJoinOpen(true);
  };

  const handleCopyLink = (meetingId: string) => {
    navigator.clipboard.writeText(`https://meet.example.com/${meetingId}`);
    toast({
      title: "Link copied",
      description: "Meeting link has been copied to clipboard.",
    });
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="h-6 w-6" />
            Online Classes
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage virtual classrooms
          </p>
        </div>
        <Button onClick={() => setIsScheduleOpen(true)} className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Class
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.liveNow}</p>
                <p className="text-sm text-muted-foreground">Live Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayClasses}</p>
                <p className="text-sm text-muted-foreground">Today's Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Play className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRecordings}</p>
                <p className="text-sm text-muted-foreground">Recordings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                <p className="text-sm text-muted-foreground">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search classes by title, subject, or teacher..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="upcoming"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Upcoming ({upcomingClasses.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Completed ({completedClasses.length})
          </TabsTrigger>
          <TabsTrigger
            value="recordings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            <Play className="h-4 w-4 mr-2" />
            Recordings ({recordedClasses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredClasses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No classes found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === "upcoming" ? "Schedule a new class to get started" : "No classes match your search"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClasses.map(cls => (
                <Card key={cls.id} className={`${cls.status === "live" ? "border-red-300 bg-red-50/50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[cls.status]}>
                          {cls.status === "live" && <span className="h-2 w-2 bg-red-500 rounded-full mr-1 animate-pulse" />}
                          {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                        </Badge>
                        <Badge variant="outline">{cls.platform}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopyLink(cls.meetingId)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2">{cls.title}</h3>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Class {cls.class}</span>
                        <span>•</span>
                        <BookOpen className="h-4 w-4" />
                        <span>{cls.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {getInitials(cls.teacher)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{cls.teacher}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(cls.startTime), "MMM d, yyyy")}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{format(new Date(cls.startTime), "h:mm a")} ({cls.duration} min)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{cls.participants}/{cls.maxParticipants} participants</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {cls.status === "live" ? (
                        <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleJoin(cls)}>
                          <Video className="h-4 w-4 mr-2" />
                          Join Now
                        </Button>
                      ) : cls.status === "scheduled" ? (
                        <Button className="flex-1" variant="outline" onClick={() => handleJoin(cls)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      ) : cls.recordingAvailable ? (
                        <Button className="flex-1" variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          Watch Recording
                        </Button>
                      ) : (
                        <Button className="flex-1" variant="outline" disabled>
                          <XCircle className="h-4 w-4 mr-2" />
                          No Recording
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule Class Modal */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Schedule Online Class
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Class Title *</Label>
              <Input placeholder="e.g., Mathematics - Chapter 5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class/Section *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8a">8A</SelectItem>
                    <SelectItem value="9a">9A</SelectItem>
                    <SelectItem value="10a">10A</SelectItem>
                    <SelectItem value="11a">11A</SelectItem>
                    <SelectItem value="12a">12A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Time *</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Select defaultValue="45">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select defaultValue="zoom">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="meet">Google Meet</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea placeholder="Brief description of the class content..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} className="bg-primary">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Class Modal */}
      <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedClass?.status === "live" ? "Join Live Class" : "Class Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h3 className="font-semibold">{selectedClass.title}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClass.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>Class {selectedClass.class}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(selectedClass.startTime), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(selectedClass.startTime), "h:mm a")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${platformColors[selectedClass.platform]} flex items-center justify-center`}>
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedClass.platform}</p>
                    <p className="text-sm text-muted-foreground font-mono">{selectedClass.meetingId}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCopyLink(selectedClass.meetingId)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {selectedClass.status === "live" && (
                <div className="flex items-center justify-center gap-4 p-4 bg-red-50 rounded-lg">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-700 font-medium">Class is Live</span>
                  <span className="text-red-600">{selectedClass.participants} joined</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinOpen(false)}>
              Close
            </Button>
            {selectedClass?.status === "live" && (
              <Button className="bg-red-600 hover:bg-red-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Join Class
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnlineClassesPage;
