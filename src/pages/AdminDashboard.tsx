import React from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  FileText,
  IndianRupee,
  MessageSquare,
  Ticket,
  AlertTriangle,
  UserMinus,
  UserCheck,
  GraduationCap,
  Briefcase,
  Clock,
  LucideIcon,
} from 'lucide-react';
import { cn } from '../utils/cn';

type CardColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'teal';

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: CardColor;
  highlighted?: boolean;
}

const colorStyles: Record<CardColor, { bg: string; text: string; icon: string; border?: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    icon: 'bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400',
  },
  purple: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-700 dark:text-violet-400',
    icon: 'bg-violet-100 dark:bg-violet-800/40 text-violet-600 dark:text-violet-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400',
    icon: 'bg-orange-100 dark:bg-orange-800/40 text-orange-600 dark:text-orange-400',
    border: 'border-2 border-orange-300 dark:border-orange-700',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    icon: 'bg-red-100 dark:bg-red-800/40 text-red-600 dark:text-red-400',
  },
  yellow: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: 'bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    text: 'text-teal-700 dark:text-teal-400',
    icon: 'bg-teal-100 dark:bg-teal-800/40 text-teal-600 dark:text-teal-400',
  },
};

const DashboardCard: React.FC<DashboardCardProps> = ({ label, value, icon: Icon, color, highlighted }) => {
  const styles = colorStyles[color];
  
  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-200 hover:shadow-md',
        styles.bg,
        highlighted && styles.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-sm font-medium mb-2', styles.text)}>{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">{value}</p>
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = React.useState('all');
  const [showBranchMenu, setShowBranchMenu] = React.useState(false);

  const branches = [
    { id: 'all', name: 'Global (All Branches)' },
    { id: 'main', name: 'Main Campus' },
    { id: 'north', name: 'North Branch' },
    { id: 'south', name: 'South Branch' },
  ];

  const currentBranch = branches.find(b => b.id === selectedBranch) || branches[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Welcome back, Super Admin!</h1>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Here's a quick overview of your portal.</p>
        </div>
        
        {/* Viewing Stats For Dropdown */}
        <div className="relative">
          <div className="text-right mb-2">
            <span className="text-sm text-gray-500 dark:text-dark-text-secondary">Viewing Stats For</span>
          </div>
          <button 
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-dark-surface-primary border border-gray-200 dark:border-dark-border-primary rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface-secondary transition-colors min-w-[220px]"
          >
            <span className="font-medium text-gray-700 dark:text-dark-text-primary">{currentBranch.name}</span>
            <svg className="w-4 h-4 ml-auto text-gray-400 dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showBranchMenu && (
            <div className="absolute right-0 top-full mt-1 w-full bg-white dark:bg-dark-surface-primary border border-gray-200 dark:border-dark-border-primary rounded-xl shadow-lg py-1 z-50">
              {branches.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranch(branch.id);
                    setShowBranchMenu(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm transition-colors',
                    branch.id === selectedBranch
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-surface-secondary'
                  )}
                >
                  {branch.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* First Row - Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Active Students"
          value="6"
          icon={Users}
          color="blue"
        />
        <DashboardCard
          label="New Admissions (30d)"
          value="3"
          icon={GraduationCap}
          color="green"
        />
        <DashboardCard
          label="Total Batches"
          value="28"
          icon={BookOpen}
          color="purple"
        />
        <DashboardCard
          label="Total Admissions"
          value="13"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Sessions This Week"
          value="103"
          icon={Calendar}
          color="blue"
        />
        <DashboardCard
          label="Present Today"
          value="0"
          icon={UserCheck}
          color="green"
        />
        <DashboardCard
          label="Absent Today"
          value="0"
          icon={UserMinus}
          color="red"
        />
        <DashboardCard
          label="Teachers Available Today"
          value="0"
          icon={Users}
          color="blue"
        />
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Installments Due (Week)"
          value="1"
          icon={IndianRupee}
          color="purple"
        />
        <DashboardCard
          label="Staff on Leave"
          value="10"
          icon={Briefcase}
          color="orange"
          highlighted
        />
        <DashboardCard
          label="Payslips (Last Month)"
          value="3"
          icon={FileText}
          color="purple"
        />
        <DashboardCard
          label="Open Doubts"
          value="8"
          icon={MessageSquare}
          color="green"
        />
      </div>

      {/* Fourth Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Open Support Tickets"
          value="3"
          icon={Ticket}
          color="red"
        />
        <DashboardCard
          label="Pending PTM Requests"
          value="3"
          icon={Clock}
          color="yellow"
        />
        <DashboardCard
          label="PTMs Today"
          value="0"
          icon={Calendar}
          color="green"
        />
        <DashboardCard
          label="Pending Transfers"
          value="0"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Fifth Row - Single Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Open Grievances"
          value="3"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Announcements */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface-primary rounded-2xl border border-gray-200 dark:border-dark-border-primary p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">Recent Announcements</h2>
            <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Batch Transfer',
                date: 'December 10, 2025',
                tag: 'System Trigger',
              },
              {
                title: 'Test',
                date: 'December 10, 2025',
                tag: 'Manual',
              },
            ].map((announcement, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-surface-secondary rounded-xl transition-colors border border-gray-100 dark:border-dark-border-primary"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-dark-text-primary">{announcement.title}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">{announcement.date}</p>
                </div>
                <span className={cn('px-3 py-1 text-xs font-semibold rounded-full', announcement.tagColor)}>
                  {announcement.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-2xl border border-gray-200 dark:border-dark-border-primary p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium text-sm shadow-sm">
              Add New Student
            </button>
            <button className="w-full px-4 py-3 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors font-medium text-sm">
              Create Batch
            </button>
            <button className="w-full px-4 py-3 border border-gray-200 dark:border-dark-border-primary text-gray-700 dark:text-dark-text-primary rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface-secondary transition-colors font-medium text-sm bg-white dark:bg-dark-surface-secondary">
              Manage Users
            </button>
            <button className="w-full px-4 py-3 border border-gray-200 dark:border-dark-border-primary text-gray-700 dark:text-dark-text-primary rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface-secondary transition-colors font-medium text-sm bg-white dark:bg-dark-surface-secondary">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
