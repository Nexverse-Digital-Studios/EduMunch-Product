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
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
  green: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-500',
  },
  purple: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-500',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    border: 'border-2 border-orange-200',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  yellow: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-500',
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
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className={cn('text-3xl font-bold', styles.text)}>{value}</p>
        </div>
        <div className={cn('p-2.5 rounded-full', styles.iconBg)}>
          <Icon className={cn('w-5 h-5', styles.iconColor)} />
        </div>
      </div>
    </div>
  );
};
