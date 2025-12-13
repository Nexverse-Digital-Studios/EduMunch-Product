# Navigation Sidebar

---

## 🎯 Development Rules for This Document

> **Rule 1:** Do NOT create any additional documentation when a prompt is given. Code and implementation are the priority.
>
> **Rule 2:** For database changes - If SQL code is needed, provide it in chat and the developer can run it directly in Supabase SQL editor. Only create SQL files if they need to be saved for future reference. Follow the folder structure: `database/migrations/[batch_number]_[feature].sql`
>
> **Rule 3:** When creating any files (SQL, components, services, etc.), follow the complete folder structure planned in `04_PROJECT_STRUCTURE.md`. No exceptions.

---

## Overview

The Navigation Sidebar is the primary navigation component across all portals. It dynamically adjusts based on user role and feature flags.

---

## Database Schema

```sql
-- Navigation Menu Items
CREATE TABLE navigation_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,                                      -- NULL = system menu
  
  label VARCHAR(255) NOT NULL,
  icon_name VARCHAR(100),                           -- lucide icon name
  path VARCHAR(255),
  
  parent_id UUID,                                   -- For nested items
  position INTEGER DEFAULT 0,
  
  -- Access Control
  required_role_ids UUID[],                         -- Which roles can see
  required_permission VARCHAR(100),
  feature_flag_key VARCHAR(100),                    -- Feature flag requirement
  
  -- Display
  badge_text VARCHAR(50),
  badge_count_query VARCHAR(500),                   -- SQL for dynamic count
  is_visible BOOLEAN DEFAULT true,
  
  -- Metadata
  portal VARCHAR(50),                               -- 'student', 'teacher', 'parent', 'admin', 'super_admin'
  entity_data JSONB DEFAULT '{}',                   -- Additional data
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_org FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_parent FOREIGN KEY (parent_id) 
    REFERENCES navigation_menu_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_nav_menu_portal ON navigation_menu_items(portal);
CREATE INDEX idx_nav_menu_org ON navigation_menu_items(org_id);
CREATE INDEX idx_nav_menu_parent ON navigation_menu_items(parent_id);
```

---

## Sidebar Component

```typescript
// src/components/layout/Sidebar/Sidebar.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user.store';
import { useOrganizationStore } from '@/store/organization.store';
import { sidebarService } from '@/services/layout/sidebar.service';
import { Menu, X, ChevronDown, LogOut } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/utils/cn';

interface SidebarProps {
  portal: 'student' | 'teacher' | 'parent' | 'admin' | 'super_admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ portal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { current: org } = useOrganizationStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Fetch navigation items
  const { data: menuItems = [] } = useQuery({
    queryKey: ['sidebar-menu', portal, org?.id, user?.id],
    queryFn: () =>
      sidebarService.getMenuItems(
        portal,
        org!.id,
        user!.id
      ),
    enabled: !!org && !!user,
  });
  
  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };
  
  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };
  
  // Get icon component
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent ? <IconComponent size={20} /> : null;
  };
  
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 hover:bg-gray-100 rounded-md"
      >
        {isCollapsed ? <Menu size={24} /> : <X size={24} />}
      </button>
      
      {/* Sidebar */}
      <aside className={cn(
        'bg-gray-900 text-white h-screen overflow-y-auto transition-all duration-300',
        'fixed left-0 top-0 z-40',
        isCollapsed ? 'w-20' : 'w-64',
        'lg:relative lg:z-0'
      )}>
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold">E</span>
                </div>
                <span className="font-bold">EduMunch</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-800 rounded hidden lg:block"
            >
              {isCollapsed ? (
                <Icons.ChevronRight size={20} />
              ) : (
                <Icons.ChevronLeft size={20} />
              )}
            </button>
          </div>
        </div>
        
        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              {/* Parent Item */}
              {item.path ? (
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full px-4 py-2 rounded-md flex items-center gap-3 transition-colors',
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-800 text-gray-300'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">
                    {getIconComponent(item.icon_name)}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge_text && (
                        <span className="bg-red-600 px-2 py-1 rounded text-xs">
                          {item.badge_text}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ) : (
                // Group Item (no path)
                <button
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    'w-full px-4 py-2 rounded-md flex items-center gap-3 hover:bg-gray-800 transition-colors',
                    'text-gray-300'
                  )}
                >
                  <span className="flex-shrink-0">
                    {getIconComponent(item.icon_name)}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={cn(
                          'transition-transform',
                          expandedItems[item.id] ? 'rotate-180' : ''
                        )}
                      />
                    </>
                  )}
                </button>
              )}
              
              {/* Child Items */}
              {item.children && item.children.length > 0 && (
                <div
                  className={cn(
                    'overflow-hidden transition-all',
                    expandedItems[item.id] ? 'max-h-96' : 'max-h-0'
                  )}
                >
                  <div className={cn(
                    'mt-1 space-y-1',
                    !isCollapsed && 'ml-4 pl-4 border-l border-gray-700'
                  )}>
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => navigate(child.path)}
                        className={cn(
                          'w-full px-4 py-2 rounded-md flex items-center gap-3 text-sm transition-colors',
                          isActive(child.path)
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-800 text-gray-400'
                        )}
                        title={isCollapsed ? child.label : undefined}
                      >
                        <span className="flex-shrink-0">
                          {getIconComponent(child.icon_name)}
                        </span>
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{child.label}</span>
                            {child.badge_text && (
                              <span className="bg-red-600 px-2 py-1 rounded text-xs">
                                {child.badge_text}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
        
        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={() => {
              // Logout
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-md transition-colors text-gray-300"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isCollapsed === false && (
        <div
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}
    </>
  );
};
```

---

## Sidebar Service

```typescript
// src/services/layout/sidebar.service.ts
import { supabase } from '@/services/api/client';
import { featureFlagsService } from '@/services/admin/feature.flags.service';

export const sidebarService = {
  async getMenuItems(
    portal: string,
    orgId: string,
    userId: string
  ) {
    // Get user roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId);
    
    const roleIds = userRoles?.map((r) => r.role_id) || [];
    
    // Get menu items
    let query = supabase
      .from('navigation_menu_items')
      .select('*')
      .eq('portal', portal)
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .eq('is_visible', true)
      .order('position');
    
    const { data: items } = await query;
    
    if (!items) return [];
    
    // Filter by role and permissions
    let filteredItems = items.filter((item) => {
      if (!item.required_role_ids || item.required_role_ids.length === 0) {
        return true;
      }
      return item.required_role_ids.some((rid) => roleIds.includes(rid));
    });
    
    // Filter by feature flags
    filteredItems = await Promise.all(
      filteredItems.map(async (item) => {
        if (item.feature_flag_key) {
          const isEnabled = await featureFlagsService.isFeatureEnabled(
            item.feature_flag_key,
            orgId
          );
          return isEnabled ? item : null;
        }
        return item;
      })
    );
    
    filteredItems = filteredItems.filter(Boolean);
    
    // Build hierarchy
    return this.buildMenuHierarchy(filteredItems);
  },
  
  buildMenuHierarchy(items: any[]) {
    const itemMap = new Map();
    const roots = [];
    
    // Create map
    items.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] });
    });
    
    // Build hierarchy
    items.forEach((item) => {
      const mappedItem = itemMap.get(item.id);
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children.push(mappedItem);
        }
      } else {
        roots.push(mappedItem);
      }
    });
    
    return roots;
  },
};
```

---

## Portal-Specific Navigation

### Student Portal Menu

```typescript
// Student sees: Dashboard, Courses, Assignments, Grades, Attendance, etc.
const studentMenuItems = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/student-portal/dashboard' },
  { label: 'Courses', icon: 'BookOpen', path: '/student-portal/courses' },
  { label: 'Assignments', icon: 'ClipboardList', path: '/student-portal/assignments' },
  { label: 'Grades', icon: 'BarChart3', path: '/student-portal/grades' },
  { label: 'Attendance', icon: 'Calendar', path: '/student-portal/attendance' },
];
```

### Teacher Portal Menu

```typescript
// Teacher sees: Dashboard, Courses, Classes, Assignments, Attendance, Grades Entry, etc.
const teacherMenuItems = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/teacher-portal/dashboard' },
  { label: 'My Courses', icon: 'BookOpen', path: '/teacher-portal/courses' },
  { label: 'Classes', icon: 'Users', path: '/teacher-portal/classes' },
  { label: 'Assignments', icon: 'ClipboardList', path: '/teacher-portal/assignments' },
  { label: 'Attendance', icon: 'Calendar', path: '/teacher-portal/attendance' },
  { label: 'Grades', icon: 'BarChart3', path: '/teacher-portal/grades' },
];
```

### Admin Portal Menu

```typescript
// Admin sees: Dashboard, Users, Courses, Branches, Reports, Settings, etc.
const adminMenuItems = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/admin-portal/dashboard' },
  {
    label: 'Users',
    icon: 'Users',
    children: [
      { label: 'All Users', path: '/admin-portal/users' },
      { label: 'Import Users', path: '/admin-portal/users/import' },
      { label: 'Roles', path: '/admin-portal/roles' },
    ],
  },
  { label: 'Academics', icon: 'BookOpen', path: '/admin-portal/academics' },
  { label: 'Branches', icon: 'Building2', path: '/admin-portal/branches' },
  { label: 'Reports', icon: 'BarChart3', path: '/admin-portal/reports' },
  { label: 'Settings', icon: 'Settings', path: '/admin-portal/settings' },
];
```

---

## Responsive Behavior

The sidebar:
- **Desktop:** Always visible, toggleable collapse to icons
- **Tablet:** Toggleable drawer
- **Mobile:** Hidden by default, slide-in drawer with overlay

---

## Next Steps

1. ✅ Create navigation menu schema
2. ✅ Implement sidebar component
3. ✅ Build sidebar service with role filtering
4. ✅ Set up portal-specific navigation
5. ✅ Complete Phase 3 - Dashboard & Users

---

**Document Updated:** December 13, 2025  
**Status:** ✅ Phase 3 Complete (All 4 Files)  
**Next Phase:** PHASE_4_ACADEMIC_FOUNDATION (Files 16-20)
