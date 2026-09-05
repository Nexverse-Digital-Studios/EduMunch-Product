import type { Doubt } from "./types";

interface DoubtsListViewProps {
  doubts: Doubt[];
  onDoubtClick: (doubt: Doubt) => void;
}

export const DoubtsListView = ({
  doubts,
  onDoubtClick,
}: DoubtsListViewProps) => {
  if (doubts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No doubts found matching your filters.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {doubts.map((doubt) => (
        <div
          key={doubt.id}
          className="py-4 cursor-pointer hover:bg-muted/50 px-2 -mx-2 rounded transition-colors"
          onClick={() => onDoubtClick(doubt)}
        >
          <h3 className="font-medium text-foreground">{doubt.title}</h3>
          <p className="text-sm text-muted-foreground">
            From: {doubt.from} • {doubt.subject} / {doubt.topic}
          </p>
        </div>
      ))}
    </div>
  );
};
