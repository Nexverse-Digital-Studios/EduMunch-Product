/**
 * Sidebar Configuration Tab
 * ==========================
 * 
 * Allows users to configure their sidebar preferences:
 * 1. Display style (dropdown vs sections)
 * 2. Which routes to show/hide
 * 
 * All preferences are stored locally in localStorage.
 */

import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  LayoutDashboard,
  List,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Lock,
  ChevronDown,
  ChevronRight,
  PanelLeft,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSidebarConfig } from '@/contexts/SidebarConfigContext';
import { SidebarDisplayStyle, ConfigurableGroup } from '@/types/sidebarConfig';
import { useToast } from '@/hooks/use-toast';

// ==========================================
// ICON RESOLVER
// ==========================================

const getIcon = (iconName?: string): React.ElementType => {
  if (!iconName) return LayoutDashboard;
  const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[iconName];
  return IconComponent || LayoutDashboard;
};

// ==========================================
// LAYOUT OPTION COMPONENT
// ==========================================

interface LayoutOptionProps {
  style: SidebarDisplayStyle;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  preview: React.ReactNode;
}

const LayoutOption = ({ style, title, description, isSelected, onSelect, preview }: LayoutOptionProps) => (
  <button
    onClick={onSelect}
    className={cn(
      "relative flex flex-col items-start gap-4 p-4 rounded-lg border-2 transition-all text-left w-full",
      isSelected
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/50 hover:bg-muted/50"
    )}
  >
    {isSelected && (
      <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
        <Check className="h-3 w-3 text-primary-foreground" />
      </div>
    )}
    
    <div className="w-full">{preview}</div>
    
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </button>
);

// ==========================================
// DROPDOWN PREVIEW
// ==========================================

const DropdownPreview = () => (
  <div className="w-full bg-sidebar rounded-lg p-3 space-y-2 border border-sidebar-border">
    <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
      <LayoutDashboard className="h-4 w-4" />
      <span>Dashboard</span>
    </div>
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-sidebar-foreground p-1 rounded bg-sidebar-accent/50">
        <div className="flex items-center gap-2">
          <LucideIcons.Users className="h-4 w-4" />
          <span>Management</span>
        </div>
        <ChevronDown className="h-3 w-3" />
      </div>
      <div className="ml-4 pl-3 border-l border-sidebar-border space-y-1">
        <div className="text-xs text-sidebar-foreground/70">Users</div>
        <div className="text-xs text-sidebar-foreground/70">Roles</div>
      </div>
    </div>
  </div>
);

// ==========================================
// SECTIONS PREVIEW
// ==========================================

const SectionsPreview = () => (
  <div className="w-full bg-sidebar rounded-lg p-3 space-y-3 border border-sidebar-border">
    <div className="space-y-1">
      <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">Home</div>
      <div className="flex items-center gap-2 text-sm text-sidebar-foreground p-1 rounded bg-sidebar-accent">
        <LayoutDashboard className="h-4 w-4" />
        <span>Dashboard</span>
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">Management</div>
      <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70 p-1">
        <LucideIcons.Users className="h-4 w-4" />
        <span>Users</span>
      </div>
    </div>
  </div>
);

// ==========================================
// ROUTE GROUP COMPONENT
// ==========================================

interface RouteGroupProps {
  group: ConfigurableGroup;
  onToggleRoute: (path: string) => void;
}

const RouteGroup = ({ group, onToggleRoute }: RouteGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = getIcon(group.icon);
  
  const visibleCount = group.routes.filter(r => r.isVisible).length;
  const totalCount = group.routes.length;
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{group.name}</span>
          <Badge variant="secondary" className="text-xs">
            {visibleCount}/{totalCount}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="divide-y">
          {group.routes.map(route => {
            const RouteIcon = getIcon(route.icon);
            return (
              <div
                key={route.path}
                className={cn(
                  "flex items-center justify-between p-3 transition-colors",
                  route.isSystemRoute 
                    ? "bg-muted/30" 
                    : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <RouteIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{route.label}</p>
                    <p className="text-xs text-muted-foreground">{route.path}</p>
                  </div>
                </div>
                
                {route.isSystemRoute ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span className="text-xs">Always visible</span>
                  </div>
                ) : (
                  <Switch
                    checked={route.isVisible}
                    onCheckedChange={() => onToggleRoute(route.path)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export const SidebarConfigTab = () => {
  const { toast } = useToast();
  const {
    displayStyle,
    setDisplayStyle,
    toggleRouteVisibility,
    getConfigurableGroups,
    showAllRoutes,
    hideAllRoutes,
    resetToDefaults,
  } = useSidebarConfig();
  
  const groups = getConfigurableGroups();
  
  const handleShowAll = () => {
    showAllRoutes();
    toast({
      title: "All routes visible",
      description: "All available routes are now shown in the sidebar.",
    });
  };
  
  const handleHideAll = () => {
    hideAllRoutes();
    toast({
      title: "Routes hidden",
      description: "All optional routes are now hidden from the sidebar.",
    });
  };
  
  const handleReset = () => {
    resetToDefaults();
    toast({
      title: "Reset to defaults",
      description: "Sidebar configuration has been reset to default settings.",
    });
  };
  
  const handleStyleChange = (style: SidebarDisplayStyle) => {
    setDisplayStyle(style);
    toast({
      title: "Layout updated",
      description: `Sidebar style changed to ${style === 'dropdown' ? 'Dropdown Groups' : 'Flat Sections'}.`,
    });
  };
  
  // Count visible routes
  const totalRoutes = groups.reduce((acc, g) => acc + g.routes.length, 0);
  const visibleRoutes = groups.reduce((acc, g) => acc + g.routes.filter(r => r.isVisible).length, 0);
  
  return (
    <div className="space-y-6">
      {/* Layout Style Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PanelLeft className="h-5 w-5" />
            Sidebar Layout
          </CardTitle>
          <CardDescription>
            Choose how your sidebar navigation is displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LayoutOption
              style="dropdown"
              title="Dropdown Groups"
              description="Collapsible groups with expandable menu items"
              isSelected={displayStyle === 'dropdown'}
              onSelect={() => handleStyleChange('dropdown')}
              preview={<DropdownPreview />}
            />
            <LayoutOption
              style="sections"
              title="Flat Sections"
              description="Organized sections with accent-colored headers"
              isSelected={displayStyle === 'sections'}
              onSelect={() => handleStyleChange('sections')}
              preview={<SectionsPreview />}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Route Visibility Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Visible Routes
              </CardTitle>
              <CardDescription className="mt-1">
                Select which routes appear in your sidebar ({visibleRoutes}/{totalRoutes} visible)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShowAll}>
                <Eye className="h-4 w-4 mr-2" />
                Show All
              </Button>
              <Button variant="outline" size="sm" onClick={handleHideAll}>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide All
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {groups.map(group => (
                <RouteGroup
                  key={group.id}
                  group={group}
                  onToggleRoute={toggleRouteVisibility}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <LucideIcons.Info className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Local Preferences</p>
              <p className="text-sm text-muted-foreground">
                Your sidebar configuration is saved locally in your browser. 
                These preferences will persist across sessions but are specific to this browser.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SidebarConfigTab;
