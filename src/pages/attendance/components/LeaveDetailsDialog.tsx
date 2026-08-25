/**
 * Leave Details Dialog
 * =====================
 * Modal dialog for viewing leave request details and approving/rejecting
 * Used inline on LeaveRequestsPage (no route navigation)
 */

import { useState } from "react";
import {
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase, TABLES } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { LeaveApplicationDB, LeaveStatus, LeaveType } from "./types";

interface LeaveDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveRequest: LeaveApplicationDB | null;
  studentName: string;
  onSuccess?: () => void;
}

const STATUS_COLORS: Record<LeaveStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const STATUS_ICONS: Record<LeaveStatus, React.ReactNode> = {
  Pending: <Clock className="h-4 w-4" />,
  Approved: <CheckCircle className="h-4 w-4" />,
  Rejected: <XCircle className="h-4 w-4" />,
};

const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  Sick: "bg-red-100 text-red-800",
  Medical: "bg-purple-100 text-purple-800",
  Casual: "bg-blue-100 text-blue-800",
  Emergency: "bg-orange-100 text-orange-800",
  Other: "bg-gray-100 text-gray-800",
};

export const LeaveDetailsDialog = ({
  open,
  onOpenChange,
  leaveRequest,
  studentName,
  onSuccess,
}: LeaveDetailsDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { canApprove } = useModulePermissions("leave");
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!leaveRequest) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from(TABLES.LEAVE_APPLICATIONS)
        .update({
          status: "Approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", leaveRequest.id);

      if (error) throw error;

      toast({
        title: "Leave Approved",
        description: "The leave request has been approved.",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error approving leave:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve leave",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
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
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", leaveRequest.id);

      if (error) throw error;

      toast({
        title: "Leave Rejected",
        description: "The leave request has been rejected.",
      });
      onOpenChange(false);
      setRejectionReason("");
      setShowRejectForm(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error rejecting leave:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject leave",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Leave Request Details
          </DialogTitle>
          <DialogDescription>
            View leave request information and take action
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={`${STATUS_COLORS[leaveRequest.status]} flex items-center gap-1`}>
                {STATUS_ICONS[leaveRequest.status]}
                {leaveRequest.status}
              </Badge>
              <Badge className={LEAVE_TYPE_COLORS[leaveRequest.leave_type]}>
                {leaveRequest.leave_type} Leave
              </Badge>
            </div>

            <Separator />

            {/* Student Info */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{studentName}</p>
                <p className="text-sm text-muted-foreground">Student</p>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">From</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(leaveRequest.from_date).toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">To</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(leaveRequest.to_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Total Days */}
            <div className="p-3 bg-primary/5 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">{leaveRequest.total_days}</p>
              <p className="text-sm text-muted-foreground">Total Days</p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{leaveRequest.reason}</p>
              </div>
            </div>

            {/* Application Info */}
            <div className="text-sm text-muted-foreground">
              <p>Applied on: {new Date(leaveRequest.applied_at).toLocaleString()}</p>
              {leaveRequest.approved_at && (
                <p>
                  {leaveRequest.status === "Approved" ? "Approved" : "Rejected"} on:{" "}
                  {new Date(leaveRequest.approved_at).toLocaleString()}
                </p>
              )}
            </div>

            {/* Rejection Reason (if rejected) */}
            {leaveRequest.status === "Rejected" && leaveRequest.rejection_reason && (
              <div className="space-y-2">
                <Label className="text-red-600">Rejection Reason</Label>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {leaveRequest.rejection_reason}
                  </p>
                </div>
              </div>
            )}

            {/* Approval Actions (only for pending) */}
            {canApprove && leaveRequest.status === "Pending" && (
              <>
                <Separator />
                
                {showRejectForm ? (
                  <div className="space-y-3">
                    <Label>Rejection Reason *</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowRejectForm(false)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isProcessing || !rejectionReason.trim()}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Confirm Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
