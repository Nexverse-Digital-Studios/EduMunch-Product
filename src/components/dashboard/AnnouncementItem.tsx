import { Megaphone } from "lucide-react";

interface AnnouncementItemProps {
  title: string;
  date: string;
  source: string;
}

export const AnnouncementItem = ({ title, date, source }: AnnouncementItemProps) => {
  return (
    <div className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Megaphone className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">
          {date} - {source}
        </p>
      </div>
    </div>
  );
};
