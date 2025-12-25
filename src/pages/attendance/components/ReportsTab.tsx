import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Types
export interface TeacherDB {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
}

interface ReportsTabProps {
  teachers: TeacherDB[];
}

export const ReportsTab = ({ teachers }: ReportsTabProps) => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Syllabus Status
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            Batch: None selected
          </span>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Choose a batch to view syllabus progress.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Teacher Activity Log
          </CardTitle>
          <Button variant="link" className="p-0 h-auto text-primary">
            View recent remarks
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Select Teacher
            </label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.first_name} {t.last_name} ({t.employee_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-auto">
            {selectedTeacher ? (
              <p className="text-center text-muted-foreground py-4">
                No activity logs found for this teacher.
              </p>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Select a teacher to view their activity log.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
