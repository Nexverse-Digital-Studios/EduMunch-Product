/**
 * Sidebar Configuration Context
 * ===============================
 * 
 * Manages user's sidebar preferences stored in localStorage.
 * Provides methods to:
 * - Get/set display style (dropdown vs sections)
 * - Toggle route visibility
 * - Manage group expansion states
 * 
 * All data is stored locally - no database calls.
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect,
  useMemo 
} from 'react';
import {
  SidebarConfig,
  SidebarDisplayStyle,
  ConfigurableRoute,
  ConfigurableGroup,
  DEFAULT_SIDEBAR_CONFIG,
  SIDEBAR_CONFIG_KEY,
  SIDEBAR_CONFIG_VERSION,
  SYSTEM_ROUTES,
} from '@/types/sidebarConfig';
import { sidebarGroups } from '@/routes';
import { usePermissions } from '@/contexts/PermissionContext';

// =============================================================================
// CONTEXT TYPE
// =============================================================================

export interface SidebarConfigContextType {
  // Current configuration
  config: SidebarConfig;
  
  // Display style
  displayStyle: SidebarDisplayStyle;
  setDisplayStyle: (style: SidebarDisplayStyle) => void;
  
  // Route visibility
  isRouteVisible: (path: string) => boolean;
  toggleRouteVisibility: (path: string) => void;
  setRouteVisibility: (path: string, visible: boolean) => void;
  
  // Group expansion (for dropdown mode)
  isGroupExpanded: (groupId: string) => boolean;
  toggleGroupExpansion: (groupId: string) => void;
  
  // Get all configurable routes (filtered by permissions)
  getConfigurableGroups: () => ConfigurableGroup[];
  
  // Bulk operations
  showAllRoutes: () => void;
  hideAllRoutes: () => void;
  resetToDefaults: () => void;
  
  // Save explicitly (auto-saves on change, but can force)
  saveConfig: () => void;
}

// =============================================================================
// STORAGE HELPERS
// =============================================================================

/**
 * Load config from localStorage with validation
 */
function loadConfigFromStorage(): SidebarConfig {
  try {
    const stored = localStorage.getItem(SIDEBAR_CONFIG_KEY);
    if (!stored) return { ...DEFAULT_SIDEBAR_CONFIG };
    
    const parsed: SidebarConfig = JSON.parse(stored);
    
    // Version check - reset if outdated
    if (parsed.version !== SIDEBAR_CONFIG_VERSION) {
      console.log('[SidebarConfig] Version mismatch, resetting to defaults');
      return { ...DEFAULT_SIDEBAR_CONFIG };
    }
    
    return parsed;
  } catch (error) {
    console.error('[SidebarConfig] Failed to load from storage:', error);
    return { ...DEFAULT_SIDEBAR_CONFIG };
  }
}

/**
 * Save config to localStorage
 */
function saveConfigToStorage(config: SidebarConfig): void {
  try {
    const toStore: SidebarConfig = {
      ...config,
      updatedAt: Date.now(),
    };
    localStorage.setItem(SIDEBAR_CONFIG_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('[SidebarConfig] Failed to save to storage:', error);
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

const SidebarConfigContext = createContext<SidebarConfigContextType | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface SidebarConfigProviderProps {
  children: React.ReactNode;
}

export function SidebarConfigProvider({ children }: SidebarConfigProviderProps) {
  const [config, setConfig] = useState<SidebarConfig>(loadConfigFromStorage);
  const { hasModuleAccess, isAdmin } = usePermissions();

  // Auto-save on config change
  useEffect(() => {
    saveConfigToStorage(config);
  }, [config]);

  // ===========================================
  // DISPLAY STYLE
  // ===========================================
  
  const setDisplayStyle = useCallback((style: SidebarDisplayStyle) => {
    setConfig(prev => ({
      ...prev,
      displayStyle: style,
    }));
  }, []);

  // ===========================================
  // ROUTE VISIBILITY
  // ===========================================
  
  const isRouteVisible = useCallback((path: string): boolean => {
    // System routes are always visible
    if (SYSTEM_ROUTES.includes(path)) return true;
    // Check if explicitly hidden
    return !config.hiddenRoutes.includes(path);
  }, [config.hiddenRoutes]);

  const toggleRouteVisibility = useCallback((path: string) => {
    // Cannot toggle system routes
    if (SYSTEM_ROUTES.includes(path)) return;
    
    setConfig(prev => {
      const isCurrentlyHidden = prev.hiddenRoutes.includes(path);
      return {
        ...prev,
        hiddenRoutes: isCurrentlyHidden
          ? prev.hiddenRoutes.filter(r => r !== path)
          : [...prev.hiddenRoutes, path],
      };
    });
  }, []);

  const setRouteVisibility = useCallback((path: string, visible: boolean) => {
    // Cannot change system routes
    if (SYSTEM_ROUTES.includes(path)) return;
    
    setConfig(prev => {
      const isCurrentlyHidden = prev.hiddenRoutes.includes(path);
      
      if (visible && isCurrentlyHidden) {
        // Make visible: remove from hidden list
        return {
          ...prev,
          hiddenRoutes: prev.hiddenRoutes.filter(r => r !== path),
        };
      } else if (!visible && !isCurrentlyHidden) {
        // Make hidden: add to hidden list
        return {
          ...prev,
          hiddenRoutes: [...prev.hiddenRoutes, path],
        };
      }
      
      return prev;
    });
  }, []);

  // ===========================================
  // GROUP EXPANSION
  // ===========================================
  
  const isGroupExpanded = useCallback((groupId: string): boolean => {
    // Not collapsed means expanded
    return !config.collapsedGroups.includes(groupId);
  }, [config.collapsedGroups]);

  const toggleGroupExpansion = useCallback((groupId: string) => {
    setConfig(prev => {
      const isCurrentlyCollapsed = prev.collapsedGroups.includes(groupId);
      return {
        ...prev,
        collapsedGroups: isCurrentlyCollapsed
          ? prev.collapsedGroups.filter(g => g !== groupId)
          : [...prev.collapsedGroups, groupId],
      };
    });
  }, []);

  // ===========================================
  // GET CONFIGURABLE ROUTES
  // ===========================================
  
  const getConfigurableGroups = useCallback((): ConfigurableGroup[] => {
    const groups: ConfigurableGroup[] = [];
    
    // Add system routes as special group
    groups.push({
      id: 'system',
      name: 'System',
      icon: 'Settings',
      isExpanded: true,
      routes: [
        {
          path: '/',
          label: 'Dashboard',
          moduleCode: 'dashboard',
          groupId: 'system',
          groupName: 'System',
          icon: 'LayoutDashboard',
          isSystemRoute: true,
          isVisible: true, // Always visible
        },
        {
          path: '/profile',
          label: 'Profile',
          moduleCode: 'profile',
          groupId: 'system',
          groupName: 'System',
          icon: 'User',
          isSystemRoute: true,
          isVisible: true, // Always visible
        },
      ],
    });
    
    // Process sidebar groups
    sidebarGroups.forEach(group => {
      const configurableRoutes: ConfigurableRoute[] = [];
      
      group.modules.forEach(module => {
        // Check if user has access to this module
        const hasAccess = isAdmin() || hasModuleAccess(module.moduleCode);
        if (!hasAccess) return;
        
        configurableRoutes.push({
          path: module.basePath,
          label: module.displayName,
          moduleCode: module.moduleCode,
          groupId: group.id,
          groupName: group.groupName,
          icon: module.icon,
          isSystemRoute: false,
          isVisible: isRouteVisible(module.basePath),
        });
      });
      
      // Only add group if it has accessible routes
      if (configurableRoutes.length > 0) {
        groups.push({
          id: group.id,
          name: group.groupName,
          icon: group.icon,
          isExpanded: isGroupExpanded(group.id),
          routes: configurableRoutes,
        });
      }
    });
    
    return groups;
  }, [hasModuleAccess, isAdmin, isRouteVisible, isGroupExpanded]);

  // ===========================================
  // BULK OPERATIONS
  // ===========================================
  
  const showAllRoutes = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      hiddenRoutes: [],
    }));
  }, []);

  const hideAllRoutes = useCallback(() => {
    // Get all non-system routes and hide them
    const allRoutes: string[] = [];
    sidebarGroups.forEach(group => {
      group.modules.forEach(module => {
        if (!SYSTEM_ROUTES.includes(module.basePath)) {
          allRoutes.push(module.basePath);
        }
      });
    });
    
    setConfig(prev => ({
      ...prev,
      hiddenRoutes: allRoutes,
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig({ ...DEFAULT_SIDEBAR_CONFIG });
  }, []);

  const saveConfig = useCallback(() => {
    saveConfigToStorage(config);
  }, [config]);

  // ===========================================
  // CONTEXT VALUE
  // ===========================================
  
  const value = useMemo<SidebarConfigContextType>(() => ({
    config,
    displayStyle: config.displayStyle,
    setDisplayStyle,
    isRouteVisible,
    toggleRouteVisibility,
    setRouteVisibility,
    isGroupExpanded,
    toggleGroupExpansion,
    getConfigurableGroups,
    showAllRoutes,
    hideAllRoutes,
    resetToDefaults,
    saveConfig,
  }), [
    config,
    setDisplayStyle,
    isRouteVisible,
    toggleRouteVisibility,
    setRouteVisibility,
    isGroupExpanded,
    toggleGroupExpansion,
    getConfigurableGroups,
    showAllRoutes,
    hideAllRoutes,
    resetToDefaults,
    saveConfig,
  ]);

  return (
    <SidebarConfigContext.Provider value={value}>
      {children}
    </SidebarConfigContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useSidebarConfig(): SidebarConfigContextType {
  const context = useContext(SidebarConfigContext);
  if (context === undefined) {
    throw new Error('useSidebarConfig must be used within a SidebarConfigProvider');
  }
  return context;
}
