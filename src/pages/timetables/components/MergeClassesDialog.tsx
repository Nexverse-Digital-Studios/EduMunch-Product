/**
 * Merge Classes Dialog
 * ====================
 * UI for selecting and merging multiple sections for a single teacher
 */

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { ClassInfo, ScheduleSlot } from "./types";

interface MergeClassesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMerge: (masterSection: string, sectionsToMerge: string[]) => void;
  schedule: ScheduleSlot[];
  branches: string[];
  timeIndex: number;
  period: string;
}

export const MergeClassesDialog = ({
  isOpen,
  onClose,
  onMerge,
  schedule,
  branches,
  timeIndex,
  period,
}: MergeClassesDialogProps) => {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set()
  );
  const [masterSection, setMasterSection] = useState<string>("");

  const slot = schedule[timeIndex];
  if (!slot) return null;

  // Get all classes for the same period
  const classesInPeriod = branches
    .map((branch) => ({
      branch,
      classInfo: slot.slots[branch],
    }))
    .filter(({ classInfo }) => classInfo !== null && !classInfo.isMerged) as {
    branch: string;
    classInfo: ClassInfo;
  }[];

  // Group by teacher-subject combination (only count non-merged classes)
  const groupedByTeacher = new Map<string, typeof classesInPeriod>();
  classesInPeriod.forEach((item) => {
    const key = `${item.classInfo.teacher}|${item.classInfo.subject}`;
    if (!groupedByTeacher.has(key)) {
      groupedByTeacher.set(key, []);
    }
    groupedByTeacher.get(key)!.push(item);
  });

  const handleSelectSection = (branch: string) => {
    const newSelected = new Set(selectedSections);
    if (newSelected.has(branch)) {
      newSelected.delete(branch);
    } else {
      newSelected.add(branch);
    }
    setSelectedSections(newSelected);
  };

  const handleMerge = () => {
    if (selectedSections.size < 2 || !masterSection) return;

    const sectionsArray = Array.from(selectedSections);
    onMerge(masterSection, sectionsArray);
    onClose();
    setSelectedSections(new Set());
    setMasterSection("");
  };

  const isValid =
    selectedSections.size >= 2 &&
    masterSection &&
    selectedSections.has(masterSection);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Merge Classes</DialogTitle>
          <DialogDescription>
            Combine multiple sections for the same teacher in period: {period}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96 pr-4">
          <div className="space-y-4">
            {Array.from(groupedByTeacher.entries()).map(([key, classes]) => {
              if (classes.length < 2) return null;

              const [teacher, subject] = key.split("|");

              return (
                <div key={key} className="border rounded-lg p-3 space-y-3">
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {subject}
                    </p>
                    <p className="text-xs text-muted-foreground">{teacher}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Select sections to merge:
                    </p>
                    {classes.map(({ branch, classInfo }) => (
                      <div
                        key={branch}
                        className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={selectedSections.has(branch)}
                          onCheckedChange={() => handleSelectSection(branch)}
                        />
                        <label className="flex-1 cursor-pointer text-sm">
                          {branch}
                        </label>
                        {masterSection === branch && (
                          <Badge variant="secondary" className="text-xs">
                            Master
                          </Badge>
                        )}
                      </div>
                    ))}

                    {selectedSections.size > 0 && (
                      <div className="mt-3 p-2 bg-muted/30 rounded">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                          Choose master section:
                        </p>
                        <div className="space-y-1">
                          {Array.from(selectedSections).map((section) => (
                            <button
                              key={section}
                              onClick={() => setMasterSection(section)}
                              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                masterSection === section
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background border border-border hover:border-primary"
                              }`}
                            >
                              {section}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {groupedByTeacher.size === 0 && (
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-sm mb-2">
                  No classes available to merge in this period
                </p>
                <p className="text-xs text-muted-foreground/70">
                  To merge classes, you need at least 2 sections with the same
                  teacher and subject at the same time period
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={!isValid}>
            <Check className="h-4 w-4 mr-2" />
            Merge Classes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
