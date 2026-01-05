/**
 * Copy Schedule Page
 * ===================
 * Copy timetable from a previous week to a new week
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  ArrowLeft,
  Calendar,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useModulePermissions } from "@/contexts/PermissionContext";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { TABLES } from "@/lib/supabase";

interface SectionDB {
  id: string;
  section_name: string;
  section_code: string;
}

interface AcademicYearDB {
  id: string;
  academic_year: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

const getWeekOptions = () => {
  const options = [];
  const today = new Date();

  // Past 8 weeks
  for (let i = 8; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    const monday = new Date(date);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    options.push({
      value: monday.toISOString().split("T")[0],
      label: `Week of ${monday.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
      isPast: true,
    });
  }

  // Current week
  const currentMonday = new Date(today);
  currentMonday.setDate(currentMonday.getDate() - currentMonday.getDay() + 1);
  options.push({
    value: currentMonday.toISOString().split("T")[0],
    label: `Current Week (${currentMonday.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })})`,
    isPast: false,
  });

  // Next 4 weeks
  for (let i = 1; i <= 4; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i * 7);
    const monday = new Date(date);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    options.push({
      value: monday.toISOString().split("T")[0],
      label: `Week of ${monday.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
      isPast: false,
    });
  }

  return options;
};

const CopySchedulePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canCreate } = useModulePermissions("timetable");

  const [sourceWeek, setSourceWeek] = useState("");
  const [targetWeek, setTargetWeek] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyCompleted, setCopyCompleted] = useState(false);

  const weekOptions = getWeekOptions();

  // Fetch sections
  const { data: sectionsData } = useSupabaseTable<SectionDB>(TABLES.SECTIONS, {
    orderBy: { column: "section_name", ascending: true },
  });

  // Fetch academic year
  const { data: academicYearData } = useSupabaseTable<AcademicYearDB>(
    TABLES.ACADEMIC_YEARS,
    {
      filters: { is_current: true },
    }
  );
  const currentAcademicYear = academicYearData?.[0];

  // Fetch and mutate timetables
  const { data: timetableData, createMutation: createTimetable } =
    useSupabaseTable(TABLES.TIMETABLES);

  const sections = sectionsData || [];

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedSections(sections.map((s) => s.id));
    } else {
      setSelectedSections([]);
    }
  };

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter((id) => id !== sectionId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedSections, sectionId];
      setSelectedSections(newSelected);
      if (newSelected.length === sections.length) {
        setSelectAll(true);
      }
    }
  };

  const handleCopy = async () => {
    if (!sourceWeek || !targetWeek) {
      toast({
        title: "Validation Error",
        description: "Please select both source and target weeks",
        variant: "destructive",
      });
      return;
    }

    if (sourceWeek === targetWeek) {
      toast({
        title: "Validation Error",
        description: "Source and target weeks cannot be the same",
        variant: "destructive",
      });
      return;
    }

    if (selectedSections.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one section",
        variant: "destructive",
      });
      return;
    }

    if (!currentAcademicYear?.id) {
      toast({
        title: "Error",
        description: "No active academic year found.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Fetch timetables from source week for selected sections
      const sourceEntries =
        timetableData?.filter(
          (entry: any) =>
            selectedSections.includes(entry.section_id) &&
            entry.is_active === true
        ) || [];

      if (sourceEntries.length === 0) {
        toast({
          title: "No entries to copy",
          description: "No timetable entries found for the selected sections.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create new entries for target week
      const newEntries = sourceEntries.map((entry: any) => ({
        id: crypto.randomUUID(),
        section_id: entry.section_id,
        subject_id: entry.subject_id,
        teacher_id: entry.teacher_id,
        period_id: entry.period_id,
        day_of_week: entry.day_of_week,
        room_number: entry.room_number || null,
        academic_year_id: currentAcademicYear.id,
        is_active: true,
      }));

      // Insert all new entries to database
      for (const newEntry of newEntries) {
        await createTimetable.mutateAsync(newEntry as any);
      }

      setCopyCompleted(true);
      toast({
        title: "Success",
        description: `Copied ${newEntries.length} timetable entries for ${selectedSections.length} sections`,
      });
    } catch (error) {
      console.error("Error copying schedule:", error);
      toast({
        title: "Error",
        description: "Failed to copy schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          You don't have permission to create timetables.
        </p>
      </div>
    );
  }

  if (copyCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold">Schedule Copied Successfully!</h2>
        <p className="text-muted-foreground">
          The timetable has been copied to the target week.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCopyCompleted(false)}>
            Copy Another
          </Button>
          <Button onClick={() => navigate("/timetable")}>
            Go to Timetable
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Copy Schedule</h1>
          <p className="text-muted-foreground">
            Copy timetable from a previous week to a new week
          </p>
        </div>
      </div>

      {/* Week Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Weeks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 space-y-2 w-full">
              <Label>Source Week (Copy From)</Label>
              <Select value={sourceWeek} onValueChange={setSourceWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source week" />
                </SelectTrigger>
                <SelectContent>
                  {weekOptions
                    .filter((w) => w.isPast)
                    .map((week) => (
                      <SelectItem key={week.value} value={week.value}>
                        {week.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />

            <div className="flex-1 space-y-2 w-full">
              <Label>Target Week (Copy To)</Label>
              <Select value={targetWeek} onValueChange={setTargetWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target week" />
                </SelectTrigger>
                <SelectContent>
                  {weekOptions.map((week) => (
                    <SelectItem key={week.value} value={week.value}>
                      {week.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Sections</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm cursor-pointer">
                Select All
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No sections found
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSections.includes(section.id)
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <Checkbox
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {section.section_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {section.section_code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleCopy} disabled={isSubmitting}>
          <Copy className="h-4 w-4 mr-2" />
          {isSubmitting ? "Copying..." : "Copy Schedule"}
        </Button>
      </div>
    </div>
  );
};

export default CopySchedulePage;
