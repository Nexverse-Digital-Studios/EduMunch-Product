/**
 * Create Leave Request Page
 * ==========================
 * Page for applying for leave
 * Route: /leave-requests/create
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Calendar, Upload, Save } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES, supabase } from "@/lib/supabase";
import {
  StudentDB,
  SectionDB,
  ClassDB,
  LeaveType,
  LeaveApplicationFormData,
} from "./types";

const LEAVE_TYPES: { value: LeaveType; label: string; description: string }[] =
  [
    {
      value: "Sick",
      label: "Sick Leave",
      description: "For illness or health issues",
    },
    {
      value: "Medical",
      label: "Medical Leave",
      description: "For medical appointments or procedures",
    },
    {
      value: "Casual",
      label: "Casual Leave",
      description: "For personal matters",
    },
    {
      value: "Emergency",
      label: "Emergency Leave",
      description: "For urgent family matters",
    },
    { value: "Other", label: "Other", description: "Any other reason" },
  ];

export const CreateLeaveRequestPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [leaveType, setLeaveType] = useState<LeaveType>("Casual");
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
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

  const getClassName = (classId: string) => {
    const cls = classes?.find((c) => c.id === classId);
    return cls?.class_name || "";
  };

  // Calculate total days
  const totalDays = useMemo(() => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diff =
      Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [fromDate, toDate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedStudent ||
      !leaveType ||
      !fromDate ||
      !toDate ||
      !reason.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (totalDays <= 0) {
      toast({
        title: "Invalid Dates",
        description: "To date must be on or after from date.",
        variant: "destructive",
      });
      return;
    }

    if (!supabase) {
      toast({
        title: "Error",
        description: "Database connection not available.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const leaveData = {
        student_id: selectedStudent,
        leave_type: leaveType,
        from_date: fromDate,
        to_date: toDate,
        total_days: totalDays,
        reason: reason.trim(),
        applied_by: selectedStudent, // In a real app, this would be the current user
        status: "Pending",
      };

      const { error } = await supabase
        .from(TABLES.LEAVE_APPLICATIONS)
        .insert([leaveData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Leave request submitted successfully.",
      });

      navigate("/leave-requests");
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/leave-requests")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Apply for Leave
          </h1>
          <p className="text-muted-foreground">
            Submit a new leave application
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Student Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Student Information</CardTitle>
            <CardDescription>
              Select the student applying for leave
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="section">Section</Label>
                <Select
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                >
                  <SelectTrigger id="section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections?.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {getClassName(section.class_id)} -{" "}
                        {section.section_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="student">Student *</Label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                  disabled={!selectedSection || loadingStudents}
                >
                  <SelectTrigger id="student">
                    <SelectValue
                      placeholder={
                        loadingStudents ? "Loading..." : "Select student"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} (
                        {student.admission_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Leave Details</CardTitle>
            <CardDescription>Provide leave information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Leave Type *</Label>
              <div className="grid gap-2 mt-2 sm:grid-cols-2 lg:grid-cols-3">
                {LEAVE_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      leaveType === type.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="leaveType"
                      value={type.value}
                      checked={leaveType === type.value}
                      onChange={() => setLeaveType(type.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="fromDate">From Date *</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="toDate">To Date *</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                />
              </div>
              <div>
                <Label>Total Days</Label>
                <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                  <span className="font-medium">{totalDays} day(s)</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Leave *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a detailed reason for your leave application..."
                rows={4}
              />
            </div>

            {(leaveType === "Sick" || leaveType === "Medical") && (
              <div>
                <Label>Medical Certificate (Optional)</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop a file, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG up to 5MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    type="button"
                  >
                    Upload File
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/leave-requests")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Submit Application
          </Button>
        </div>
      </form>
    </div>
  );
};
