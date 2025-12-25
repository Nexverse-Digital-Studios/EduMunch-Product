import { ChevronLeft, ChevronRight, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface WeekSelectorProps {
  selectedWeek: string;
  onWeekChange: (date: string) => void;
  onNavigateWeek: (direction: "prev" | "next") => void;
  onClearWeek: () => void;
  onNotifyWeek: () => void;
}

export const WeekSelector = ({
  selectedWeek,
  onWeekChange,
  onNavigateWeek,
  onClearWeek,
  onNotifyWeek,
}: WeekSelectorProps) => {
  const getWeekDates = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(selectedWeek);
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigateWeek("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Select Week</Label>
            <Input
              type="date"
              value={selectedWeek}
              onChange={(e) => onWeekChange(e.target.value)}
              className="w-40"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigateWeek("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {weekDates.map((date, i) => (
            <Badge key={i} variant="outline" className="font-normal">
              {formatDate(date)}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button variant="destructive" onClick={onClearWeek}>
            <X className="h-4 w-4 mr-2" />
            Clear Week
          </Button>
          <Button variant="outline" onClick={onNotifyWeek}>
            <Send className="h-4 w-4 mr-2" />
            Notify Week
          </Button>
        </div>
      </div>
    </div>
  );
};
