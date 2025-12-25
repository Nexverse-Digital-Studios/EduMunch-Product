import { Plus, Pencil, Trash2, Link2 } from "lucide-react";
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
}

export const TimetableGrid = ({
  schedule,
  branches,
  onAddClass,
  onEditClass,
  onDeleteClass,
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
                    className={`flex-1 min-w-[150px] p-2 border-r border-border last:border-r-0 min-h-[80px] group hover:bg-muted/20 transition-colors ${
                      classInfo?.isMerged ? "bg-primary/10" : ""
                    }`}
                  >
                    {classInfo ? (
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {classInfo.subject}
                            </p>
                            <p className="text-xs text-primary">
                              {classInfo.teacher}
                            </p>
                            {classInfo.isMerged && (
                              <Badge
                                variant="outline"
                                className="mt-1 text-xs bg-primary/10 text-primary border-primary/30"
                              >
                                <Link2 className="h-3 w-3 mr-1" />
                                MERGED
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() =>
                                onEditClass(rowIndex, branch, classInfo)
                              }
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() =>
                                onDeleteClass(rowIndex, branch, classInfo)
                              }
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
