/**
 * Grievance Chat Component
 * =========================
 * Chat-like interface for parent-teacher communication
 * Supports real-time messaging with status updates
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  Send,
  Loader2,
  User,
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGrievanceChat, useGrievances } from "./useGrievances";
import { GrievanceStatus } from "./types";

export const GrievanceChat = () => {
  const { grievanceId } = useParams<{ grievanceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const { grievance, messages, isLoading, isParentUser, sendMessage, refresh } =
    useGrievanceChat(grievanceId || "");

  const { updateStatus, markAsRead } = useGrievances();

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const roleCode = userProfile?.primary_role?.role_code;
  const isTeacher = roleCode === "teacher";

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (grievance && messages.length > 0 && grievanceId) {
      // Mark as read after a short delay
      const timer = setTimeout(() => {
        markAsRead(grievanceId, isParentUser);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [grievance, messages.length, grievanceId, markAsRead, isParentUser]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const success = await sendMessage(newMessage.trim());
    setIsSending(false);

    if (success) {
      setNewMessage("");
      inputRef.current?.focus();
    } else {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (status: GrievanceStatus) => {
    if (!grievanceId) return;

    setIsUpdatingStatus(true);
    const result = await updateStatus(grievanceId, status);
    setIsUpdatingStatus(false);

    if (result.success) {
      toast({
        title: "Status Updated",
        description: `Grievance marked as ${status}`,
      });
      refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = (status: GrievanceStatus) => {
    switch (status) {
      case "Open":
        return <Clock className="h-4 w-4" />;
      case "In Progress":
        return <MessageSquare className="h-4 w-4" />;
      case "Resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "Closed":
        return <XCircle className="h-4 w-4" />;
      case "Escalated":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: GrievanceStatus) => {
    switch (status) {
      case "Open":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "In Progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Closed":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "Escalated":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-500";
      case "Normal":
        return "bg-blue-500/10 text-blue-500";
      case "Low":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "";
    }
  };

  // Helper to get display names from grievance data
  const getStudentName = () => {
    if (!grievance?.student) return "Unknown Student";
    return `${grievance.student.first_name} ${grievance.student.last_name}`;
  };

  const getTeacherName = () => {
    if (!grievance?.teacher) return "Unknown Teacher";
    return `${grievance.teacher.first_name} ${grievance.teacher.last_name}`;
  };

  const getParentName = () => {
    return grievance?.parent?.full_name || "Unknown Parent";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!grievance) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Grievance not found</p>
        <Button variant="outline" onClick={() => navigate("/grievances")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Grievances
        </Button>
      </div>
    );
  }

  const isClosed =
    grievance.status === "Closed" || grievance.status === "Resolved";

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="py-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/grievances")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{grievance.subject}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {grievance.grievance_number}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    {getStudentName()}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {isParentUser
                      ? `Teacher: ${getTeacherName()}`
                      : `Parent: ${getParentName()}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(grievance.priority)}>
                {grievance.priority}
              </Badge>
              <Badge
                className={`${getStatusColor(
                  grievance.status as GrievanceStatus
                )} flex items-center gap-1`}
              >
                {getStatusIcon(grievance.status as GrievanceStatus)}
                {grievance.status}
              </Badge>

              {/* Status Actions - Only for teachers */}
              {isTeacher && !isClosed && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("In Progress")}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Mark In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("Resolved")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("Closed")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Close Grievance
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("Escalated")}
                      className="text-red-500"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Escalate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 rounded-none border-b-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          {/* Initial Description */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Badge variant="outline">{grievance.category}</Badge>
              <span>•</span>
              <span>
                {format(new Date(grievance.created_at), "MMM d, yyyy h:mm a")}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">
              {grievance.description}
            </p>
          </div>

          <Separator className="my-4" />

          {/* Messages */}
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === userProfile?.id;
                const senderName =
                  message.sender_type === "Parent"
                    ? getParentName()
                    : getTeacherName();

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={
                          isOwn ? "bg-primary text-primary-foreground" : ""
                        }
                      >
                        {message.sender_type === "Parent" ? "P" : "T"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[70%] ${
                        isOwn ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                          isOwn ? "justify-end" : ""
                        }`}
                      >
                        <span>{senderName}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(message.created_at), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Message Input */}
      <Card className="rounded-t-none">
        <CardContent className="p-3">
          {isClosed ? (
            <div className="text-center py-2 text-muted-foreground">
              <p className="text-sm">
                This grievance is {grievance.status.toLowerCase()}. No new
                messages can be sent.
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isSending || !newMessage.trim()}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GrievanceChat;
