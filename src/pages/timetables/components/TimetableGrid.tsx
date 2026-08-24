import { Plus, Pencil, Trash2, Link2, Unlink2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { ScheduleSlot, ClassInfo } from "./types";

interface TimetableGridProps {
  schedule: ScheduleSlot[];
  branches: string[];
  onAddClass: (timeIndex: number, branch: string) => void;
  onEditClass: (
    timeIndex: number,
    branch: string,
    classInfo: ClassInfo
  ) => void;
  onDeleteClass: (
    timeIndex: number,
    branch: string,
    classInfo: ClassInfo
  ) => void;
  onMergeClick?: (timeIndex: number, period: string) => void;
  onUnmergeClick?: (timeIndex: number, masterSection: string) => void;
}

// Helper function to check if a class can be merged with other sections
const canMergeClass = (
  classInfo: ClassInfo,
  slot: ScheduleSlot,
  branches: string[],
  currentBranch: string
): boolean => {
  if (classInfo.isMerged) return false;

  // Count how many other sections have the same teacher and subject in this time slot
  const mergeableCount = branches.filter((branch) => {
    if (branch === currentBranch) return false;
    const otherClass = slot.slots[branch];
    return (
      otherClass &&
      !otherClass.isMerged &&
      otherClass.teacher === classInfo.teacher &&
      otherClass.subject === classInfo.subject
    );
  }).length;

  return mergeableCount > 0;
};

export const TimetableGrid = ({
  schedule,
  branches,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onMergeClick,
  onUnmergeClick,
}: TimetableGridProps) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <ScrollArea className="w-full">
        <div className="min-w-[1200px]">
          {/* Header */}
          <div className="flex bg-muted/30 border-b border-border">
            <div className="w-28 flex-shrink-0 p-3 border-r border-border">
              <span className="font-medium text-foreground">Time</span>
            </div>
            {branches.map((branch) => (
              <div
                key={branch}
                className="flex-1 min-w-[150px] p-3 border-r border-border last:border-r-0"
              >
                <span className="font-medium text-foreground text-sm">
                  {branch}
                </span>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {schedule.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex border-b border-border last:border-b-0"
            >
              <div className="w-28 flex-shrink-0 p-3 border-r border-border bg-muted/10">
                <span className="text-sm text-foreground font-mono">
                  {row.time}
                </span>
              </div>
              {branches.map((branch) => {
                const classInfo = row.slots[branch];
                return (
                  <div
                    key={branch}
                    className="flex-1 min-w-[150px] p-2 border-r border-border last:border-r-0 min-h-[80px] group hover:bg-muted/20 transition-colors"
                    style={
                      classInfo?.isMerged
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(167, 139, 250, 0.4) 0%, rgba(168, 85, 247, 0.25) 50%, rgba(167, 139, 250, 0.3) 100%)",
                            borderLeft: "4px solid rgb(124, 58, 242)",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                          }
                        : {}
                    }
                  >
                    {classInfo ? (
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">
                              {classInfo.subject}
                            </p>
                            <p className="text-xs text-primary">
                              {classInfo.teacher}
                            </p>
                            {classInfo.isMerged && classInfo.mergedSections && (
                              <div className="mt-2 space-y-2">
                                <Badge
                                  style={{
                                    backgroundColor: "rgba(167, 139, 250, 0.6)",
                                    color: "rgb(46, 16, 101)",
                                    borderColor: "rgb(167, 139, 250)",
                                  }}
                                  variant="outline"
                                  className="text-xs font-semibold"
                                >
                                  <Link2 className="h-3 w-3 mr-1" />
                                  MERGED ({classInfo.mergedSections.length})
                                </Badge>
                                <div
                                  className="text-xs p-2 rounded font-medium"
                                  style={{
                                    backgroundColor: "rgba(167, 139, 250, 0.2)",
                                    borderColor: "rgba(167, 139, 250, 0.5)",
                                    color: "rgb(46, 16, 101)",
                                    borderWidth: "1px",
                                  }}
                                >
                                  <div className="font-semibold mb-1">
                                    Sections:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {classInfo.mergedSections.map((section) => (
                                      <span
                                        key={section}
                                        className="px-2 py-0.5 rounded text-xs font-semibold"
                                        style={{
                                          backgroundColor:
                                            "rgba(167, 139, 250, 0.5)",
                                          color: "rgb(15, 3, 40)",
                                        }}
                                      >
                                        {section}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() =>
                                onEditClass(rowIndex, branch, classInfo)
                              }
                              title="Edit class"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            {classInfo.isMerged && onUnmergeClick ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-primary"
                                onClick={() => onUnmergeClick(rowIndex, branch)}
                                title="Unmerge classes"
                              >
                                <Unlink2 className="h-3 w-3" />
                              </Button>
                            ) : !classInfo.isMerged &&
                              onMergeClick &&
                              canMergeClass(
                                classInfo,
                                row,
                                branches,
                                branch
                              ) ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-primary"
                                onClick={() => onMergeClick(rowIndex, row.time)}
                                title="Merge with other sections"
                              >
                                <Link2 className="h-3 w-3" />
                              </Button>
                            ) : null}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() =>
                                onDeleteClass(rowIndex, branch, classInfo)
                              }
                              title="Delete class"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        onClick={() => onAddClass(rowIndex, branch)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
