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
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800/40',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-800/40',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-800/40',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    icon: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/40',
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
        'p-5 rounded-2xl transition-all hover:shadow-md',
        colors.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-sm font-medium mb-2', colors.text)}>{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">{value}</p>

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
