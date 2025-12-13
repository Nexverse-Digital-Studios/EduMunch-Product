export interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  badge?: number | string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'super_admin';

export interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
