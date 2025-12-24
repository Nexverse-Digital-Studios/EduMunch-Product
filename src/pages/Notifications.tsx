import { useState } from "react";
import { Send, Clock, Search, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationHistory {
  id: number;
  title: string;
  message: string;
  date: string;
  time: string;
  sentBy: string;
  target: string;
  recipientCount: number;
}

const notificationHistory: NotificationHistory[] = [
  { id: 1, title: "Batch Transfer", message: "Student test 1 has been transferred from CET Palava 25 to JEE Advance Batch 2026.", date: "12/10/2025", time: "12:56:48 PM", sentBy: "Super Admin", target: "Invalid Target", recipientCount: 0 },
  { id: 2, title: "Batch Transfer", message: "Student test 1 has been transferred from JEE Advance Batch 2026 to CET Palava 25.", date: "12/10/2025", time: "12:56:33 PM", sentBy: "Super Admin", target: "Invalid Target", recipientCount: 0 },
  { id: 3, title: "Test", message: "Hello", date: "12/10/2025", time: "3:40:58 AM", sentBy: "Super Admin", target: "All Users", recipientCount: 34 },
  { id: 4, title: "Parent Replied", message: "New message on ticket #8: \"hello...\"", date: "12/10/2025", time: "2:49:46 AM", sentBy: "Soham Kalani", target: "Invalid Target", recipientCount: 2 },
  { id: 5, title: "New Doubt Message", message: "New message from Kumar Kalani regarding: \"I didn't understand the initial part\"", date: "12/10/2025", time: "2:48:37 AM", sentBy: "Kumar Kalani", target: "Teachers", recipientCount: 5 },
];

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("send");
  const [title, setTitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [link, setLink] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Target audience filters
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [tieUpFilter, setTieUpFilter] = useState("all");

  const handleSend = () => {
    // Handle send notification
    console.log({ title, messageText, link });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Send Notifications</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="send"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send New
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Send New Tab */}
        <TabsContent value="send" className="mt-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Compose Notification</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Title<span className="text-destructive">*</span>
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title"
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter your message"
                  className="min-h-32 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Link (Optional)</Label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://your-website.com/link"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground">Target Audience</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Role(s)</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="teacher">Teachers</SelectItem>
                      <SelectItem value="parent">Parents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Branch(es)</Label>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      <SelectItem value="kalyan">Kalyan Branch</SelectItem>
                      <SelectItem value="thane">Thane HO Branch</SelectItem>
                      <SelectItem value="manpada">Manpada Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Course(s)</Label>
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="jee">JEE Foundation</SelectItem>
                      <SelectItem value="neet">NEET Prep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Batch(es)</Label>
                  <Select value={batchFilter} onValueChange={setBatchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      <SelectItem value="jee2026">JEE Advance Batch 2026</SelectItem>
                      <SelectItem value="neet2026">NEET Batch 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-muted-foreground">Tie-up School(s)</Label>
                  <Select value={tieUpFilter} onValueChange={setTieUpFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tie-Up Schools" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tie-Up Schools</SelectItem>
                      <SelectItem value="school1">ABC School</SelectItem>
                      <SelectItem value="school2">XYZ School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSend} className="bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6 space-y-6">
          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search title or message"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Tie-Ups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tie-Ups</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end mt-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">50</span> / 50 (max 50)
              </p>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notificationHistory.map((notification) => (
              <div key={notification.id} className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    <p className="text-muted-foreground text-sm">{notification.message}</p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Badge variant="outline" className="text-xs">
                        To: {notification.target}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {notification.recipientCount}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm space-y-1">
                    <p className="text-muted-foreground">{notification.date}, {notification.time}</p>
                    <p className="text-muted-foreground">by <span className="text-foreground">{notification.sentBy}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
