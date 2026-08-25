/**
 * Leave Form Dialog
 * ==================
 * Modal dialog for creating/editing leave requests
 * Used inline on LeaveRequestsPage (no route navigation)
 */

import { useState, useMemo, useEffect } from "react";
import { Loader2, Calendar, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  StudentDB,
  SectionDB,
  ClassDB,
  LeaveType,
  LeaveApplicationDB,
} from "./types";

interface LeaveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: LeaveApplicationDB | null;
  onSuccess?: () => void;
}

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: "Sick", label: "Sick Leave" },
  { value: "Medical", label: "Medical Leave" },
  { value: "Casual", label: "Casual Leave" },
  { value: "Emergency", label: "Emergency Leave" },
  { value: "Other", label: "Other" },
];

export const LeaveFormDialog = ({
  open,
  onOpenChange,
  editData,
  onSuccess,
}: LeaveFormDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!editData;

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [leaveType, setLeaveType] = useState<LeaveType>("Casual");
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  const { data: sections } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    orderBy: { column: "section_name", ascending: true },
  });

  const { data: classes } = useSupabaseTable<ClassDB>(TABLES.CLASSES, {
    orderBy: { column: "display_order", ascending: true },
  });

  const { data: students, isLoading: loadingStudents } =
    useSupabaseTable<StudentDB>(TABLES.STUDENTS, {
      filters: selectedSection ? { section_id: selectedSection } : {},
      orderBy: { column: "first_name", ascending: true },
    });

  // Initialize form with edit data
  useEffect(() => {
    if (editData) {
      setSelectedStudent(editData.student_id);
      setLeaveType(editData.leave_type);
      setFromDate(editData.from_date);
      setToDate(editData.to_date);
      setReason(editData.reason);
    } else {
      resetForm();
    }
  }, [editData, open]);

  const resetForm = () => {
    setSelectedStudent("");
    setSelectedSection("");
    setLeaveType("Casual");
    setFromDate(new Date().toISOString().split("T")[0]);
    setToDate(new Date().toISOString().split("T")[0]);
    setReason("");
  };

  const getClassName = (classId: string) => {
    const cls = classes?.find((c) => c.id === classId);
    return cls?.class_name || "";
  };

  // Calculate total days
  const totalDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  }, [fromDate, toDate]);

  // Validate form
  const isValid = selectedStudent && leaveType && fromDate && toDate && reason && totalDays > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      if (isEditing && editData) {
        // Update existing
        const { error } = await supabase
          .from(TABLES.LEAVE_APPLICATIONS)
          .update({
            leave_type: leaveType,
            from_date: fromDate,
            to_date: toDate,
            total_days: totalDays,
            reason: reason,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editData.id);

        if (error) throw error;

        toast({
          title: "Leave Request Updated",
          description: "The leave request has been updated successfully.",
        });
      } else {
        // Create new
        const { error } = await supabase.from(TABLES.LEAVE_APPLICATIONS).insert({
          student_id: selectedStudent,
          leave_type: leaveType,
          from_date: fromDate,
          to_date: toDate,
          total_days: totalDays,
          reason: reason,
          applied_by: user?.id || "system",
          applied_at: new Date().toISOString(),
          status: "Pending",
        });

        if (error) throw error;

        toast({
          title: "Leave Request Created",
          description: "The leave request has been submitted for approval.",
        });
      }

      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (error: any) {
      console.error("Error saving leave request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save leave request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEditing ? "Edit Leave Request" : "New Leave Request"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the leave request details"
              : "Fill in the details to submit a leave request"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4 pr-4">
            {/* Section Selection (only for new) */}
            {!isEditing && (
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections?.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {getClassName(section.class_id)} - {section.section_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Student Selection (only for new) */}
            {!isEditing && (
              <div className="space-y-2">
                <Label>Student *</Label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                  disabled={!selectedSection || loadingStudents}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingStudents
                          ? "Loading students..."
                          : !selectedSection
                          ? "Select section first"
                          : "Select student"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.admission_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Leave Type */}
            <div className="space-y-2">
              <Label>Leave Type *</Label>
              <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date *</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>To Date *</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                  required
                />
              </div>
            </div>

            {/* Total Days */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Total Days: <span className="text-primary">{totalDays}</span>
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for leave..."
                rows={3}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? "Update Request" : "Submit Request"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
