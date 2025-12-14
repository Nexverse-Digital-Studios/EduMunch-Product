import { BookOpen, Users, AlertCircle, CheckSquare } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';

export const TeacherDashboard: React.FC = () => {
  const stats = [
    {
      label: 'My Classes',
      value: '4',
      icon: BookOpen,
      color: 'primary' as const,
    },
    {
      label: 'Total Students',
      value: '65',
      icon: Users,
      color: 'success' as const,
    },
    {
      label: 'Pending Assignments',
      value: '8',
      icon: AlertCircle,
      color: 'warning' as const,
    },
    {
      label: 'Attendance Rate',
      value: '88%',
      icon: CheckSquare,
      color: 'success' as const,
      trend: 'up' as const,
      trendValue: '+3%',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Teacher Dashboard</h1>
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
        <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">Today's Schedule</h2>
        <p className="text-gray-500 dark:text-dark-text-secondary">No classes scheduled for today</p>
      </div>
    </div>
  );
};
