/**
 * Announcements Page - School-wide Announcements Management
 *
 * Features:
 * - Create and publish announcements
 * - Target specific audiences (all, students, parents, teachers, staff)
 * - Schedule announcements
 * - View announcement history
 * - Pin important announcements
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Pin,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Bell,
  Globe,
  GraduationCap,
  UserCheck,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Demo announcements data
const demoAnnouncements = [
  {
    id: 1,
    title: "Annual Sports Day 2026",
    content: "We are excited to announce that the Annual Sports Day will be held on January 15th, 2026. All students are required to participate. Parents are cordially invited to attend and cheer for their children.",
    type: "event",
    audience: "all",
    publishDate: "2026-01-02",
    expiryDate: "2026-01-15",
    isPinned: true,
    isActive: true,
    views: 1250,
    createdBy: "Principal",
    priority: "high",
  },
  {
    id: 2,
    title: "Fee Payment Reminder - January 2026",
    content: "This is a reminder that the fee payment for January 2026 is due by 10th January. Please ensure timely payment to avoid late fees. Online payment options are available through the parent portal.",
    type: "reminder",
    audience: "parents",
    publishDate: "2026-01-01",
    expiryDate: "2026-01-10",
    isPinned: false,
    isActive: true,
    views: 890,
    createdBy: "Accounts",
    priority: "medium",
  },
  {
    id: 3,
    title: "Winter Break Schedule",
    content: "The school will remain closed for winter break from December 25th to January 1st. Classes will resume on January 2nd, 2026. Wishing everyone a happy holiday season!",
    type: "holiday",
    audience: "all",
    publishDate: "2025-12-20",
    expiryDate: "2026-01-02",
    isPinned: false,
    isActive: false,
    views: 2100,
    createdBy: "Admin",
    priority: "low",
  },
  {
    id: 4,
    title: "Parent-Teacher Meeting Schedule",
    content: "The PTM for classes 1-5 is scheduled for January 8th and for classes 6-12 on January 9th. Please book your slots through the parent portal or contact the class teacher.",
    type: "meeting",
    audience: "parents",
    publishDate: "2026-01-03",
    expiryDate: "2026-01-09",
    isPinned: true,
    isActive: true,
    views: 650,
    createdBy: "Academic Head",
    priority: "high",
  },
  {
    id: 5,
    title: "New Library Books Available",
    content: "We have added 500+ new books to our library including the latest fiction, science, and reference materials. Students are encouraged to visit the library and explore the new collection.",
    type: "general",
    audience: "students",
    publishDate: "2026-01-01",
    expiryDate: null,
    isPinned: false,
    isActive: true,
    views: 420,
    createdBy: "Librarian",
    priority: "low",
  },
  {
    id: 6,
    title: "Staff Training Workshop",
    content: "A mandatory training workshop on 'Digital Teaching Methods' will be conducted on January 6th from 2 PM to 5 PM in the conference hall. All teaching staff must attend.",
    type: "training",
    audience: "teachers",
    publishDate: "2026-01-02",
    expiryDate: "2026-01-06",
    isPinned: false,
    isActive: true,
    views: 85,
    createdBy: "HR",
    priority: "medium",
  },
];

const audienceOptions = [
  { value: "all", label: "Everyone", icon: Globe },
  { value: "students", label: "Students Only", icon: GraduationCap },
  { value: "parents", label: "Parents Only", icon: Users },
  { value: "teachers", label: "Teachers Only", icon: UserCheck },
  { value: "staff", label: "Staff Only", icon: Briefcase },
];

const typeOptions = [
  { value: "general", label: "General", color: "bg-blue-100 text-blue-700" },
  { value: "event", label: "Event", color: "bg-purple-100 text-purple-700" },
  { value: "reminder", label: "Reminder", color: "bg-yellow-100 text-yellow-700" },
  { value: "holiday", label: "Holiday", color: "bg-green-100 text-green-700" },
  { value: "meeting", label: "Meeting", color: "bg-orange-100 text-orange-700" },
  { value: "training", label: "Training", color: "bg-pink-100 text-pink-700" },
  { value: "emergency", label: "Emergency", color: "bg-red-100 text-red-700" },
];

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

export const AnnouncementsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<typeof demoAnnouncements[0] | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
    audience: "all",
    priority: "medium",
    isPinned: false,
    scheduleDate: "",
    expiryDate: "",
    sendNotification: true,
  });

  const stats = {
    total: demoAnnouncements.length,
    active: demoAnnouncements.filter(a => a.isActive).length,
    pinned: demoAnnouncements.filter(a => a.isPinned).length,
    totalViews: demoAnnouncements.reduce((acc, a) => acc + a.views, 0),
  };

  const filteredAnnouncements = demoAnnouncements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && announcement.isActive;
    if (activeTab === "pinned") return matchesSearch && announcement.isPinned;
    if (activeTab === "archived") return matchesSearch && !announcement.isActive;
    return matchesSearch;
  });

  const handleCreate = () => {
    toast({
      title: "Announcement created",
      description: "Your announcement has been published successfully.",
    });
    setIsCreateModalOpen(false);
    setFormData({
      title: "",
      content: "",
      type: "general",
      audience: "all",
      priority: "medium",
      isPinned: false,
      scheduleDate: "",
      expiryDate: "",
      sendNotification: true,
    });
  };

  const handleView = (announcement: typeof demoAnnouncements[0]) => {
    setSelectedAnnouncement(announcement);
    setIsViewModalOpen(true);
  };

  const getTypeStyle = (type: string) => {
    return typeOptions.find(t => t.value === type)?.color || "bg-gray-100 text-gray-600";
  };

  const getAudienceIcon = (audience: string) => {
    const option = audienceOptions.find(a => a.value === audience);
    return option ? option.icon : Globe;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Announcements
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage school-wide announcements
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Pin className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pinned}</p>
                <p className="text-sm text-muted-foreground">Pinned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {typeOptions.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            All ({demoAnnouncements.length})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Active ({demoAnnouncements.filter(a => a.isActive).length})
          </TabsTrigger>
          <TabsTrigger
            value="pinned"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Pinned ({demoAnnouncements.filter(a => a.isPinned).length})
          </TabsTrigger>
          <TabsTrigger
            value="archived"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Archived ({demoAnnouncements.filter(a => !a.isActive).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredAnnouncements.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No announcements found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredAnnouncements.map(announcement => {
                const AudienceIcon = getAudienceIcon(announcement.audience);
                return (
                  <Card key={announcement.id} className={`${announcement.isPinned ? 'border-primary/50 bg-primary/5' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-2 flex-wrap">
                            {announcement.isPinned && (
                              <Pin className="h-4 w-4 text-primary mt-1" />
                            )}
                            <h3 className="font-semibold text-lg text-foreground">{announcement.title}</h3>
                            <Badge className={getTypeStyle(announcement.type)}>
                              {typeOptions.find(t => t.value === announcement.type)?.label}
                            </Badge>
                            <Badge className={priorityColors[announcement.priority]}>
                              {announcement.priority}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">{announcement.content}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(announcement.publishDate), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <AudienceIcon className="h-4 w-4" />
                              {audienceOptions.find(a => a.value === announcement.audience)?.label}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {announcement.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {announcement.createdBy}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={announcement.isActive ? "default" : "secondary"}>
                            {announcement.isActive ? "Active" : "Archived"}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => handleView(announcement)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Announcement Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Create New Announcement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter announcement title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your announcement content here..."
                className="min-h-[120px]"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={formData.audience} onValueChange={(v) => setFormData({ ...formData, audience: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audienceOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pin Announcement</p>
                  <p className="text-sm text-muted-foreground">Show at the top of the list</p>
                </div>
                <Switch
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Send Notification</p>
                  <p className="text-sm text-muted-foreground">Notify target audience via email/SMS</p>
                </div>
                <Switch
                  checked={formData.sendNotification}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendNotification: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-primary">
              <Send className="h-4 w-4 mr-2" />
              Publish Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Announcement Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAnnouncement?.isPinned && <Pin className="h-5 w-5 text-primary" />}
              {selectedAnnouncement?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4 py-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getTypeStyle(selectedAnnouncement.type)}>
                  {typeOptions.find(t => t.value === selectedAnnouncement.type)?.label}
                </Badge>
                <Badge className={priorityColors[selectedAnnouncement.priority]}>
                  {selectedAnnouncement.priority} priority
                </Badge>
                <Badge variant={selectedAnnouncement.isActive ? "default" : "secondary"}>
                  {selectedAnnouncement.isActive ? "Active" : "Archived"}
                </Badge>
              </div>
              <p className="text-foreground whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Published: {format(new Date(selectedAnnouncement.publishDate), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedAnnouncement.views} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Created by: {selectedAnnouncement.createdBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Audience: {audienceOptions.find(a => a.value === selectedAnnouncement.audience)?.label}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button className="bg-primary">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsPage;
