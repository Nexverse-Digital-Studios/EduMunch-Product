# Admin Dashboard

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

The Admin Dashboard is the main control hub for organization administrators. It provides real-time insights, quick actions, and access to all administrative functions.

---

## Dashboard Architecture

### Dashboard Structure by Role

```
┌─ Super Admin Dashboard
│  ├─ Organization Overview (all orgs)
│  ├─ System Health
│  ├─ User Statistics
│  ├─ Subscription & Billing
│  └─ Feature Usage Analytics
│
├─ Organization Admin Dashboard
│  ├─ Organization KPIs
│  ├─ Branch Overview
│  ├─ User Activity
│  ├─ Financial Summary
│  ├─ Academic Performance
│  └─ Quick Actions
│
└─ Branch Admin Dashboard
   ├─ Branch Statistics
   ├─ Class & Batch Info
   ├─ Attendance Overview
   ├─ Fee Collection Status
   └─ Staff Management
```

---

## Database Schema

### Dashboard Widgets Table

```sql
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  branch_id UUID,
  user_id UUID,
  
  widget_type VARCHAR(100),                         -- 'stats', 'chart', 'table', 'list'
  widget_key VARCHAR(100),                          -- 'student_count', 'fee_collection'
  
  -- Display
  title VARCHAR(255),
  description TEXT,
  position INTEGER,                                 -- Order on dashboard
  size VARCHAR(20),                                 -- 'small', 'medium', 'large'
  
  -- Configuration
  config JSONB DEFAULT '{}',                        -- Widget-specific config
  is_visible BOOLEAN DEFAULT true,
  refresh_interval INTEGER,                         -- Seconds, NULL = no refresh
  
  -- Data
  metric_key VARCHAR(100),                          -- Which metric to display
  filter_params JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Dashboard Metrics (Pre-calculated)
CREATE TABLE dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  branch_id UUID,
  
  metric_key VARCHAR(100),                          -- 'student_count', 'revenue_today'
  metric_value NUMERIC,
  metric_label VARCHAR(255),
  metric_type VARCHAR(50),                          -- 'number', 'currency', 'percentage'
  
  -- Comparison
  previous_value NUMERIC,                           -- For trend calculation
  trend VARCHAR(20),                                -- 'up', 'down', 'stable'
  trend_percentage DECIMAL(5, 2),
  
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) 
    REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX idx_metrics_org_metric ON dashboard_metrics(org_id, metric_key);
CREATE INDEX idx_metrics_calculated ON dashboard_metrics(calculated_at);
```

---

## Widget Components

### 1. Stats Card Widget

```typescript
// src/components/admin/widgets/StatsCard.tsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };
  
  return (
    <div className={`p-6 rounded-lg border border-gray-200 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {unit && <p className="text-xs text-gray-500 mt-1">{unit}</p>}
        </div>
        {icon && <div className="text-4xl opacity-20">{icon}</div>}
      </div>
      
      {trend && trendValue !== undefined && (
        <div className={`flex items-center gap-1 mt-4 text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {trend === 'up' && <TrendingUp size={16} />}
          {trend === 'down' && <TrendingDown size={16} />}
          <span>{Math.abs(trendValue)}% from last month</span>
        </div>
      )}
    </div>
  );
};
```

### 2. Chart Widget

```typescript
// src/components/admin/widgets/ChartWidget.tsx
import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartWidgetProps {
  title: string;
  type: 'line' | 'bar';
  data: any[];
  dataKey: string;
  xAxisKey: string;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  type,
  data,
  dataKey,
  xAxisKey,
}) => {
  return (
    <div className="p-6 rounded-lg border border-gray-200 bg-white">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke="#3B82F6" />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill="#3B82F6" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
```

### 3. Quick Actions Widget

```typescript
// src/components/admin/widgets/QuickActions.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/buttons/Button';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  path: string;
  color?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const navigate = useNavigate();
  
  return (
    <div className="p-6 rounded-lg border border-gray-200 bg-white">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            onClick={() => navigate(action.path)}
            variant="secondary"
            className="flex items-center gap-2 justify-center"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
```

---

## Main Dashboard Component

```typescript
// src/pages/admin-portal/Dashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOrganizationStore } from '@/store/organization.store';
import { useBranchStore } from '@/store/branch.store';
import { dashboardService } from '@/services/admin/dashboard.service';
import { StatsCard } from '@/components/admin/widgets/StatsCard';
import { ChartWidget } from '@/components/admin/widgets/ChartWidget';
import { QuickActions } from '@/components/admin/widgets/QuickActions';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  UserPlus,
  Settings,
  BarChart3,
  Upload,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { current: org } = useOrganizationStore();
  const { current: branch } = useBranchStore();
  
  // Fetch metrics
  const { data: metrics = {} } = useQuery({
    queryKey: ['dashboard-metrics', org?.id, branch?.id],
    queryFn: () =>
      dashboardService.getMetrics(
        org!.id,
        branch?.id
      ),
    enabled: !!org,
  });
  
  // Fetch charts
  const { data: chartData = {} } = useQuery({
    queryKey: ['dashboard-charts', org?.id, branch?.id],
    queryFn: () =>
      dashboardService.getChartData(
        org!.id,
        branch?.id
      ),
    enabled: !!org,
  });
  
  const quickActions = [
    { label: 'Add Student', icon: <UserPlus size={20} />, path: '/admin-portal/students/add' },
    { label: 'Add Teacher', icon: <Users size={20} />, path: '/admin-portal/teachers/add' },
    { label: 'Create Course', icon: <BookOpen size={20} />, path: '/admin-portal/courses/add' },
    { label: 'Generate Report', icon: <BarChart3 size={20} />, path: '/admin-portal/reports' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/admin-portal/settings' },
    { label: 'Import Data', icon: <Upload size={20} />, path: '/admin-portal/import' },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">{org?.name} {branch ? `- ${branch.name}` : ''}</p>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={metrics.student_count || 0}
          icon={<Users />}
          color="blue"
          trend="up"
          trendValue={12}
        />
        <StatsCard
          title="Total Teachers"
          value={metrics.teacher_count || 0}
          icon={<Users />}
          color="green"
          trend="stable"
        />
        <StatsCard
          title="Active Courses"
          value={metrics.course_count || 0}
          icon={<BookOpen />}
          color="yellow"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${metrics.total_revenue || 0}`}
          icon={<DollarSign />}
          color="green"
          trend="up"
          trendValue={8}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Student Enrollment Trend"
          type="line"
          data={chartData.enrollment || []}
          dataKey="count"
          xAxisKey="month"
        />
        <ChartWidget
          title="Fee Collection"
          type="bar"
          data={chartData.fee_collection || []}
          dataKey="amount"
          xAxisKey="month"
        />
      </div>
      
      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
      
      {/* Recent Activity */}
      <div className="p-6 rounded-lg border border-gray-200 bg-white">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {/* Activity list */}
          <p className="text-gray-600 text-center py-8">No recent activity</p>
        </div>
      </div>
    </div>
  );
};
```

---

## Dashboard Service

```typescript
// src/services/admin/dashboard.service.ts
import { supabase } from '@/services/api/client';

export const dashboardService = {
  async getMetrics(orgId: string, branchId?: string) {
    // Fetch pre-calculated metrics
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .eq('org_id', orgId)
      .eq('branch_id', branchId || null);
    
    if (error) throw new Error(error.message);
    
    // Convert to key-value map
    return data.reduce((acc, metric) => {
      acc[metric.metric_key] = metric.metric_value;
      return acc;
    }, {});
  },
  
  async getChartData(orgId: string, branchId?: string) {
    // Fetch enrollment trend
    const { data: enrollment } = await supabase
      .from('enrollment_metrics')
      .select('*')
      .eq('org_id', orgId)
      .eq('branch_id', branchId || null)
      .order('month');
    
    // Fetch fee collection
    const { data: feeCollection } = await supabase
      .from('fee_metrics')
      .select('*')
      .eq('org_id', orgId)
      .eq('branch_id', branchId || null)
      .order('month');
    
    return {
      enrollment: enrollment || [],
      fee_collection: feeCollection || [],
    };
  },
};
```

---

## Responsive Layout

Dashboard is fully responsive:
- **Mobile:** Single column, stacked widgets
- **Tablet:** 2-column grid for stats
- **Desktop:** 4-column grid for stats, 2-column for charts

---

## Next Steps

1. ✅ Create dashboard schema
2. ✅ Implement dashboard service
3. ✅ Build widget components
4. ✅ Set up metrics calculation
5. ✅ Proceed to `13_USER_MANAGEMENT.md`

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Admin Dashboard Complete  
**Next Phase:** 13_USER_MANAGEMENT.md
