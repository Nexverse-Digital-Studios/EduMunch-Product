import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

export type CardColorType = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'teal';

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: CardColorType;
  highlighted?: boolean;
  onClick?: () => void;
}

const colorStyles: Record<CardColorType, { bg: string; text: string; iconBg: string; iconColor: string; border?: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-800/40',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-800/40',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  purple: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-700 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-800/40',
    iconColor: 'text-violet-500 dark:text-violet-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-800/40',
    iconColor: 'text-orange-500 dark:text-orange-400',
    border: 'border-2 border-orange-200 dark:border-orange-700',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-800/40',
    iconColor: 'text-red-500 dark:text-red-400',
  },
  yellow: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-800/40',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    text: 'text-teal-600 dark:text-teal-400',
    iconBg: 'bg-teal-100 dark:bg-teal-800/40',
    iconColor: 'text-teal-500 dark:text-teal-400',
  },
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  highlighted = false,
  onClick,
}) => {
  const styles = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-5 rounded-2xl transition-all duration-200 cursor-pointer',
        styles.bg,
        highlighted ? styles.border : '',
        'hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1">{label}</p>
          <p className={cn('text-3xl font-bold', styles.text)}>{value}</p>
        </div>
        <div className={cn('p-2.5 rounded-full', styles.iconBg)}>
          <Icon className={cn('w-5 h-5', styles.iconColor)} />
        </div>
      </div>
    </div>
  );
};
