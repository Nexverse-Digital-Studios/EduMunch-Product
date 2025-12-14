import { Users, Award, IndianRupee, AlertCircle } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';

export const ParentDashboard: React.FC = () => {
  const stats = [
    {
      label: 'My Children',
      value: '2',
      icon: Users,
      color: 'primary' as const,
    },
    {
      label: 'Average Attendance',
      value: '94%',
      icon: AlertCircle,
      color: 'success' as const,
      trend: 'up' as const,
      trendValue: '+1%',
    },
    {
      label: 'Fees Due',
      value: '₹45,000',
      icon: IndianRupee,
      color: 'warning' as const,
    },
    {
      label: 'Average Grade',
      value: 'A-',
      icon: Award,
      color: 'success' as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Parent Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-dark-surface-primary rounded-2xl border border-gray-200 dark:border-dark-border-primary p-6 shadow-sm dark:shadow-none">
        <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">Recent Activities</h2>
        <p className="text-gray-500 dark:text-dark-text-secondary">No recent activities to show</p>
      </div>
    </div>
  );
};
