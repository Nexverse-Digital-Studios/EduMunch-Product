/**
 * Messages Page - Internal Messaging System
 *
 * Features:
 * - Inbox, Sent, Drafts views
 * - Compose new messages
 * - Reply to messages
 * - Search and filter messages
 * - Star/Archive messages
 *
 * Note: Currently using demo data. Full Supabase integration pending.
 */
import { useState } from "react";
import {
  Mail,
  Send,
  Inbox,
  FileText,
  Star,
  Archive,
  Trash2,
  Search,
  Plus,
  Reply,
  Forward,
  MoreVertical,
  Paperclip,
  Clock,
  User,
  Users,
  CheckCheck,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { format } from "date-fns";

// Demo messages data
const demoMessages = [
  {
    id: 1,
    from: { name: "Dr. Rajesh Kumar", role: "Principal", email: "principal@edumunch.edu" },
    to: "All Staff",
    subject: "Staff Meeting - January 5th",
    preview: "Dear colleagues, please be reminded that we have a mandatory staff meeting scheduled for...",
    content: "Dear colleagues,\n\nPlease be reminded that we have a mandatory staff meeting scheduled for January 5th, 2026 at 3:00 PM in the main conference hall.\n\nAgenda:\n1. Academic year review\n2. New policy updates\n3. Upcoming events planning\n4. Q&A session\n\nKindly confirm your attendance by replying to this message.\n\nBest regards,\nDr. Rajesh Kumar\nPrincipal",
    date: "2026-01-04T09:30:00",
    isRead: false,
    isStarred: true,
    hasAttachment: false,
    folder: "inbox",
  },
  {
    id: 2,
    from: { name: "Accounts Department", role: "Admin", email: "accounts@edumunch.edu" },
    to: "You",
    subject: "Salary Credit Confirmation - December 2025",
    preview: "Your salary for December 2025 has been credited to your bank account...",
    content: "Dear Staff,\n\nThis is to inform you that your salary for December 2025 has been credited to your registered bank account on December 30th, 2025.\n\nPlease check your payslip in the HR portal for detailed breakdown.\n\nFor any queries, please contact the accounts department.\n\nRegards,\nAccounts Team",
    date: "2026-01-03T14:15:00",
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    folder: "inbox",
  },
  {
    id: 3,
    from: { name: "HR Department", role: "Admin", email: "hr@edumunch.edu" },
    to: "You",
    subject: "Leave Application Approved",
    preview: "Your leave application for January 10-12, 2026 has been approved...",
    content: "Dear Staff,\n\nWe are pleased to inform you that your leave application for January 10-12, 2026 (3 days - Casual Leave) has been approved by your reporting manager.\n\nPlease ensure proper handover of your responsibilities before going on leave.\n\nBest regards,\nHR Department",
    date: "2026-01-02T11:00:00",
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    folder: "inbox",
  },
  {
    id: 4,
    from: { name: "Priya Sharma", role: "Parent", email: "priya.sharma@email.com" },
    to: "You",
    subject: "Query about PTM Schedule",
    preview: "I wanted to confirm the PTM date and time for my child Arjun...",
    content: "Dear Teacher,\n\nI hope this message finds you well. I wanted to confirm the PTM date and time for my child Arjun Sharma, Class 8A.\n\nI saw the announcement about PTM on January 8th, but I wanted to know if I can get an early morning slot around 9 AM as I have office commitments in the afternoon.\n\nPlease let me know if this is possible.\n\nThank you,\nPriya Sharma\nParent of Arjun Sharma (8A)",
    date: "2026-01-02T08:45:00",
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    folder: "inbox",
  },
  {
    id: 5,
    from: { name: "You", role: "Teacher", email: "you@edumunch.edu" },
    to: "Priya Sharma",
    subject: "Re: Query about PTM Schedule",
    preview: "Dear Mrs. Sharma, Thank you for reaching out. I have noted your preference...",
    content: "Dear Mrs. Sharma,\n\nThank you for reaching out. I have noted your preference for an early morning slot.\n\nI am pleased to confirm that I can meet you at 9:00 AM on January 8th. Arjun is doing well in his studies, and I look forward to discussing his progress with you.\n\nBest regards,\nClass Teacher",
    date: "2026-01-02T10:30:00",
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: "sent",
  },
  {
    id: 6,
    from: { name: "Academic Coordinator", role: "Admin", email: "academic@edumunch.edu" },
    to: "All Teachers",
    subject: "Syllabus Completion Report Due",
    preview: "Reminder: Please submit your syllabus completion report for Term 1...",
    content: "Dear Teachers,\n\nThis is a reminder that the syllabus completion report for Term 1 is due by January 7th, 2026.\n\nPlease use the attached template and submit to the academic coordinator's office or email.\n\nRegards,\nAcademic Coordinator",
    date: "2026-01-01T16:00:00",
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    folder: "inbox",
  },
];

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox, count: 4 },
  { id: "sent", label: "Sent", icon: Send, count: 1 },
  { id: "drafts", label: "Drafts", icon: FileText, count: 0 },
  { id: "starred", label: "Starred", icon: Star, count: 2 },
  { id: "archive", label: "Archive", icon: Archive, count: 0 },
  { id: "trash", label: "Trash", icon: Trash2, count: 0 },
];

const recipientOptions = [
  { value: "all-staff", label: "All Staff" },
  { value: "all-teachers", label: "All Teachers" },
  { value: "all-parents", label: "All Parents" },
  { value: "department", label: "Select Department" },
  { value: "individual", label: "Individual" },
];

export const MessagesPage = () => {
  const { toast } = useToast();
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedMessage, setSelectedMessage] = useState<typeof demoMessages[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  
  // Compose form state
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    content: "",
  });

  const filteredMessages = demoMessages.filter(msg => {
    const matchesSearch = msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.preview.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFolder === "starred") return matchesSearch && msg.isStarred;
    if (activeFolder === "sent") return matchesSearch && msg.folder === "sent";
    return matchesSearch && msg.folder === "inbox";
  });

  const unreadCount = demoMessages.filter(m => !m.isRead && m.folder === "inbox").length;

  const handleSend = () => {
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
    setIsComposeOpen(false);
    setComposeData({ to: "", subject: "", content: "" });
  };

  const handleReply = () => {
    if (selectedMessage) {
      setComposeData({
        to: selectedMessage.from.email,
        subject: `Re: ${selectedMessage.subject}`,
        content: `\n\n---\nOn ${format(new Date(selectedMessage.date), "MMM d, yyyy 'at' h:mm a")}, ${selectedMessage.from.name} wrote:\n\n${selectedMessage.content}`,
      });
      setIsComposeOpen(true);
    }
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
            <Mail className="h-6 w-6" />
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            Internal messaging and communication
          </p>
        </div>
        <Button onClick={() => setIsComposeOpen(true)} className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Folders */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolder(folder.id);
                    setSelectedMessage(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    activeFolder === folder.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <folder.icon className="h-4 w-4" />
                    <span className="font-medium">{folder.label}</span>
                  </span>
                  {folder.count > 0 && (
                    <Badge
                      variant={activeFolder === folder.id ? "secondary" : "default"}
                      className="ml-auto"
                    >
                      {folder.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message List & View */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border min-h-[600px]">
              {/* Message List */}
              <div className="flex flex-col">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  {filteredMessages.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages found</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredMessages.map(message => (
                        <button
                          key={message.id}
                          onClick={() => setSelectedMessage(message)}
                          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                            selectedMessage?.id === message.id ? "bg-muted" : ""
                          } ${!message.isRead ? "bg-primary/5" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={`${!message.isRead ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                {getInitials(message.from.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`font-medium truncate ${!message.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                                  {message.from.name}
                                </span>
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {format(new Date(message.date), "MMM d")}
                                </span>
                              </div>
                              <p className={`text-sm truncate ${!message.isRead ? "font-medium" : ""}`}>
                                {message.subject}
                              </p>
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {message.preview}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {message.isStarred && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                )}
                                {message.hasAttachment && (
                                  <Paperclip className="h-3 w-3 text-muted-foreground" />
                                )}
                                {!message.isRead && (
                                  <Circle className="h-2 w-2 fill-primary text-primary" />
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Message View */}
              <div className="flex flex-col">
                {selectedMessage ? (
                  <>
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleReply}>
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        <Button variant="outline" size="sm">
                          <Forward className="h-4 w-4 mr-1" />
                          Forward
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            {selectedMessage.isStarred ? "Unstar" : "Star"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(selectedMessage.from.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{selectedMessage.from.name}</p>
                                <p className="text-sm text-muted-foreground">{selectedMessage.from.email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(selectedMessage.date), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span>To: {selectedMessage.to}</span>
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap text-foreground">{selectedMessage.content}</p>
                        </div>
                        {selectedMessage.hasAttachment && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                Attachments (1)
                              </p>
                              <div className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">document.pdf</span>
                                <Badge variant="secondary" className="text-xs">PDF</Badge>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">Select a message to read</p>
                      <p className="text-sm">Choose from your messages on the left</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compose Modal */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Compose Message
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>To</Label>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Enter email addresses..."
                  className="flex-1"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Enter subject..."
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Write your message here..."
                className="min-h-[200px]"
                value={composeData.content}
                onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
              Save Draft
            </Button>
            <Button onClick={handleSend} className="bg-primary">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesPage;
