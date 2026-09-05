import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student, Installment } from "./types";

interface SearchStudentTabProps {
  students: Student[];
  installments: Installment[];
  selectedStudent: string;
  onStudentChange: (studentId: string) => void;
  onRecordPayment: (installment: Installment) => void;
}

export const SearchStudentTab = ({
  students,
  installments,
  selectedStudent,
  onStudentChange,
  onRecordPayment,
}: SearchStudentTabProps) => {
  const currentStudent = students.find((s) => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-full max-w-md space-y-2">
          <Label className="text-muted-foreground">
            Select Student Admission
          </Label>
          <Select value={selectedStudent} onValueChange={onStudentChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} ({student.course})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentStudent && (
        <>
          {/* Student Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Student</p>
              <h3 className="text-lg font-semibold text-foreground">
                {currentStudent.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Form #: {currentStudent.formNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                Course: {currentStudent.course}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Due</p>
              <h3 className="text-2xl font-bold text-foreground">
                ₹{currentStudent.totalDue.toLocaleString("en-IN")}.00
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentStudent.installments} installment(s)
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Total Paid / Balance
              </p>
              <h3 className="text-2xl font-bold text-green-600">
                ₹{currentStudent.totalPaid.toLocaleString("en-IN")}.00
              </h3>
              <p className="text-sm text-destructive">
                ₹{currentStudent.balance.toLocaleString("en-IN")}.00
              </p>
            </div>
          </div>

          {/* Installments */}
          <div className="space-y-4">
            {installments.map((installment) => (
              <div
                key={installment.id}
                className="bg-card border border-border rounded-lg p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">
                        {installment.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Due Date: {installment.dueDate}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ₹
                      {installment.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 border-yellow-300"
                    >
                      {installment.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      ₹
                      {installment.remaining.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      remaining
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="font-medium text-foreground">Transactions</p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => onRecordPayment(installment)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Record Payment
                      </Button>
                      <Button variant="outline">
                        <Bell className="h-4 w-4 mr-2" />
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                  {installment.transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-4 text-center py-4">
                      No transactions recorded.
                    </p>
                  ) : (
                    <div className="mt-4">
                      {/* Transactions would be listed here */}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
