/**
 * Leave Request Details Page
 * ===========================
 * Page for viewing and approving/rejecting leave requests
 * Routes:
 * - /leave-requests/:id - View leave request details
 * - /leave-requests/:id/approve - Approve/reject leave
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES, supabase } from "@/lib/supabase";
import { useModulePermissions } from "@/contexts/PermissionContext";
import {
  LeaveApplicationDB,
  LeaveStatus,
  LeaveType,
  StudentDB,
  SectionDB,
  ClassDB,
} from "./types";

const STATUS_COLORS: Record<LeaveStatus, string> = {
  Pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  Sick: "bg-red-100 text-red-800",
  Medical: "bg-purple-100 text-purple-800",
  Casual: "bg-blue-100 text-blue-800",
  Emergency: "bg-orange-100 text-orange-800",
  Other: "bg-gray-100 text-gray-800",
};

export const LeaveRequestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { canApprove } = useModulePermissions("leave");

  const isApproveMode = location.pathname.endsWith("/approve");

  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Fetch data
  const {
    data: leaveApplications,
    isLoading: loadingLeave,
    refetch,
  } = useSupabaseTable<LeaveApplicationDB>(TABLES.LEAVE_APPLICATIONS, {
    filters: id ? { id: id } : {},
  });

  const { data: students } = useSupabaseTable<StudentDB>(TABLES.STUDENTS, {
    orderBy: { column: "first_name", ascending: true },
  });

  const { data: sections } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    orderBy: { column: "section_name", ascending: true },
  });

  const { data: classes } = useSupabaseTable<ClassDB>(TABLES.CLASSES, {
    orderBy: { column: "display_order", ascending: true },
  });

  const leaveRequest = leaveApplications?.[0];

  // Get related data
  const getStudentName = (studentId: string) => {
    const student = students?.find((s) => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "Unknown";
  };

  const getStudentInfo = (studentId: string) => {
    return students?.find((s) => s.id === studentId);
  };

  const getSectionName = (sectionId: string) => {
    const section = sections?.find((s) => s.id === sectionId);
    if (!section) return "Unknown";
    const cls = classes?.find((c) => c.id === section.class_id);
    return `${cls?.class_name || ""} - ${section.section_name}`;
  };

  // Handle approve
  const handleApprove = async () => {
    if (!supabase || !leaveRequest) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from(TABLES.LEAVE_APPLICATIONS)
        .update({
          status: "Approved",
          approved_at: new Date().toISOString(),
          // approved_by would be the current user ID
        })
        .eq("id", leaveRequest.id);

      if (error) throw error;

      toast({
        title: "Leave Approved",
        description: "The leave request has been approved successfully.",
      });

      refetch();
      setShowApproveDialog(false);
    } catch (error) {
      console.error("Error approving leave:", error);
      toast({
        title: "Error",
        description: "Failed to approve leave request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!supabase || !leaveRequest) return;

    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from(TABLES.LEAVE_APPLICATIONS)
        .update({
          status: "Rejected",
          rejection_reason: rejectionReason.trim(),
          approved_at: new Date().toISOString(),
        })
        .eq("id", leaveRequest.id);

      if (error) throw error;

      toast({
        title: "Leave Rejected",
        description: "The leave request has been rejected.",
      });

      refetch();
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast({
        title: "Error",
        description: "Failed to reject leave request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingLeave) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading leave request...</span>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/leave-requests")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leave Requests
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Leave request not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const student = getStudentInfo(leaveRequest.student_id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/leave-requests")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Leave Request Details</h1>
          <p className="text-muted-foreground">
            {isApproveMode
              ? "Review and approve/reject this request"
              : "View leave application details"}
          </p>
        </div>
        <Badge className={STATUS_COLORS[leaveRequest.status]}>
          {leaveRequest.status}
        </Badge>
      </div>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Student Name</p>
              <p className="font-medium">
                {getStudentName(leaveRequest.student_id)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admission Number</p>
              <p className="font-medium">{student?.admission_number || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Class & Section</p>
              <p className="font-medium">
                {student ? getSectionName(student.section_id) : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Applied On</p>
              <p className="font-medium">
                {new Date(leaveRequest.applied_at).toLocaleDateString()} at{" "}
                {new Date(leaveRequest.applied_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Leave Type</p>
              <Badge className={LEAVE_TYPE_COLORS[leaveRequest.leave_type]}>
                {leaveRequest.leave_type}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">From Date</p>
              <p className="font-medium">
                {new Date(leaveRequest.from_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To Date</p>
              <p className="font-medium">
                {new Date(leaveRequest.to_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Days</p>
              <p className="font-medium">{leaveRequest.total_days} day(s)</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Reason for Leave
            </p>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p>{leaveRequest.reason}</p>
              </CardContent>
            </Card>
          </div>

          {leaveRequest.medical_certificate_url && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Medical Certificate
              </p>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                View Attachment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Info */}
      {leaveRequest.status !== "Pending" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {leaveRequest.status === "Approved" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {leaveRequest.status} Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaveRequest.approved_at && (
                <p className="text-sm">
                  <span className="text-muted-foreground">
                    {leaveRequest.status === "Approved"
                      ? "Approved"
                      : "Rejected"}{" "}
                    on:{" "}
                  </span>
                  {new Date(leaveRequest.approved_at).toLocaleDateString()}
                </p>
              )}
              {leaveRequest.rejection_reason && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Reason for rejection:
                  </p>
                  <p className="text-sm mt-1">
                    {leaveRequest.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {canApprove && leaveRequest.status === "Pending" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Take Action</CardTitle>
            <CardDescription>
              Approve or reject this leave request
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => setShowApproveDialog(true)}
            >
              <CheckCircle className="h-4 w-4" />
              Approve Leave
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="h-4 w-4" />
              Reject Leave
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Leave Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the leave request for{" "}
              {getStudentName(leaveRequest.student_id)} from{" "}
              {new Date(leaveRequest.from_date).toLocaleDateString()} to{" "}
              {new Date(leaveRequest.to_date).toLocaleDateString()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Approve"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Leave Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this leave request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectionReason">Reason for Rejection *</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
