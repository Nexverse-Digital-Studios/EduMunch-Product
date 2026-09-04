export interface RoleDB {
  id: string;
  role_code: string;
  role_name: string;
  description: string | null;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleDB {
  id: string;
  module_code: string;
  module_name: string;
  parent_module_id: string | null;
  description: string | null;
  route_prefix: string | null;
  icon: string | null;
  display_order: number | null;
  is_active: boolean;
}

export interface PermissionDB {
  id: string;
  module_id: string;
  permission_code: string;
  permission_name: string;
  description: string | null;
  resource_type: string | null;
  resource_path: string | null;
  is_active: boolean;
}

export interface RolePermissionDB {
  id: string;
  role_id: string;
  permission_id: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
  constraints: Record<string, unknown> | null;
}

export interface PermissionFormState {
  [permissionId: string]: {
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_approve: boolean;
    can_export: boolean;
  };
}

export interface RoleFormData {
  role_name: string;
  role_code: string;
  description: string;
  is_active: boolean;
}
