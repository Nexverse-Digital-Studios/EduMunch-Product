/**
 * Notifications.tsx - Send and View Notifications
 * 
 * Supabase Tables (Tier 1):
 * - notifications_1EMAET: User notifications
 * - announcements_1EMAET: System announcements
 * 
 * Schema Reference:
 * - notifications: user_id, title, message, notification_type, is_read, link
 * - announcements: title, content, target_audience, publish_date
 */
import { useState, useMemo } from "react";
import { Send, Clock, Search, RefreshCw, Users, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseInsert } from "@/hooks/useSupabaseQuery";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const INDEX_TOKEN = import.meta.env.VITE_INDEX_TOKEN || '1EMAET';

interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: string;
  target_audience: string;
  publish_date: string;
  expiry_date: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
}

interface Branch {
  id: string;
  name: string;
}

interface Batch {
  id: string;
  name: string;
}

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("send");
  const [title, setTitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [link, setLink] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [targetAudience, setTargetAudience] = useState("All");

  // Target audience filters
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const { canRead, canCreate } = useModulePermissions('COMMUNICATION');
  const { toast } = useToast();

  // Fetch announcements (as notification history)
  const { data: announcements = [], isLoading, error, refetch } = useSupabaseQuery<Announcement>(
    `announcements_${INDEX_TOKEN}`,
    { 
      select: '*',
      orderBy: { column: 'created_at', ascending: false }
    }
  );

  // Fetch branches for filter
  const { data: branches = [] } = useSupabaseQuery<Branch>(
    `branches_${INDEX_TOKEN}`,
    { select: 'id, name' }
  );

  // Fetch batches for filter
  const { data: batches = [] } = useSupabaseQuery<Batch>(
    `batches_${INDEX_TOKEN}`,
    { select: 'id, name' }
  );

  // Insert mutation for announcements
  const insertMutation = useSupabaseInsert<Partial<Announcement>>(
    `announcements_${INDEX_TOKEN}`,
    {
      onSuccess: () => {
        toast({ title: "Success", description: "Notification sent successfully" });
        setTitle("");
        setMessageText("");
        setLink("");
        setTargetAudience("All");
        refetch();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  );

  const handleSend = () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    insertMutation.mutate({
      title: title.trim(),
      content: messageText.trim(),
      announcement_type: 'Notification',
      target_audience: targetAudience,
      publish_date: new Date().toISOString(),
      is_active: true
    });
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchesSearch = searchQuery === "" || 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [announcements, searchQuery]);

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
            History ({announcements.length})
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
                  <Label className="text-muted-foreground">Audience</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Users</SelectItem>
                      <SelectItem value="Students">Students Only</SelectItem>
                      <SelectItem value="Teachers">Teachers Only</SelectItem>
                      <SelectItem value="Parents">Parents Only</SelectItem>
                      <SelectItem value="Staff">Staff Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Branch (Optional)</Label>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {canCreate && (
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSend} 
                  disabled={insertMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {insertMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load notifications: {error.message}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <SelectValue placeholder="All Audiences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="Students">Students</SelectItem>
                  <SelectItem value="Teachers">Teachers</SelectItem>
                  <SelectItem value="Parents">Parents</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="flex justify-end mt-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredAnnouncements.length}</span> notifications
              </p>
            </div>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((notification) => (
                <div key={notification.id} className="bg-card border border-border rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      <p className="text-muted-foreground text-sm">{notification.content || 'No message'}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Badge variant="outline" className="text-xs">
                          To: {notification.target_audience || 'All'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {notification.announcement_type || 'Notification'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <p className="text-muted-foreground">
                        {format(new Date(notification.created_at), 'MMM dd, yyyy h:mm a')}
                      </p>
                      <p className="text-muted-foreground">
                        by <span className="text-foreground">{notification.created_by || 'System'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredAnnouncements.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No notifications found.</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
