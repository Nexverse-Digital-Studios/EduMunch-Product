import { cn } from "../../utils/cn";
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const colorClasses = {
  primary: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50',
    border: 'dark:border-blue-800/30',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50',
    border: 'dark:border-emerald-800/30',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50',
    border: 'dark:border-amber-800/30',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-950/50',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50',
    border: 'dark:border-red-800/30',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
}) => {
  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        'p-6 rounded-2xl transition-all hover:shadow-lg border dark:shadow-none',
        colors.bg,
        colors.border,
        'border-gray-100'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-sm font-medium mb-3', colors.text)}>{label}</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">{value}</p>

          {trendValue && (
            <div className="flex items-center gap-1">
              {trend === 'up' && (
                <>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-600">{trendValue}</span>
                </>
              )}
              {trend === 'down' && (
                <>
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">{trendValue}</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
