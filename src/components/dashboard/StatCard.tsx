import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme: "blue" | "green" | "yellow" | "orange" | "red" | "purple" | "teal";
}

const colorClasses = {
  blue: {
    bg: "bg-stat-blue-bg",
    text: "text-stat-blue",
    icon: "bg-stat-blue-bg text-stat-blue",
  },
  green: {
    bg: "bg-stat-green-bg",
    text: "text-stat-green",
    icon: "bg-stat-green-bg text-stat-green",
  },
  yellow: {
    bg: "bg-stat-yellow-bg",
    text: "text-stat-yellow",
    icon: "bg-stat-yellow-bg text-stat-yellow",
  },
  orange: {
    bg: "bg-stat-orange-bg",
    text: "text-stat-orange",
    icon: "bg-stat-orange-bg text-stat-orange",
  },
  red: {
    bg: "bg-stat-red-bg",
    text: "text-stat-red",
    icon: "bg-stat-red-bg text-stat-red",
  },
  purple: {
    bg: "bg-stat-purple-bg",
    text: "text-stat-purple",
    icon: "bg-stat-purple-bg text-stat-purple",
  },
  teal: {
    bg: "bg-stat-teal-bg",
    text: "text-stat-teal",
    icon: "bg-stat-teal-bg text-stat-teal",
  },
};

export const StatCard = ({ title, value, icon: Icon, colorScheme }: StatCardProps) => {
  const colors = colorClasses[colorScheme];

  return (
    <div className={cn("rounded-xl border border-border p-5 transition-shadow hover:shadow-md", colors.bg)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("mt-2 text-3xl font-bold", colors.text)}>{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
