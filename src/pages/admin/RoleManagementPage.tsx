import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { uiConfig } from '@/config/ui.config';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_system_role: boolean;
  is_custom_role: boolean;
  permission_count?: number;
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          slug,
          description,
          is_system_role,
          is_custom_role,
          role_permissions(count)
        `)
        .order('is_system_role', { ascending: false });

      if (error) throw error;
      
      const rolesWithCounts = data?.map(role => ({
        ...role,
        permission_count: (role.role_permissions as any)?.length || 0
      })) || [];
      
      setRoles(rolesWithCounts);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (roleId: string, isSystemRole: boolean) => {
    if (isSystemRole) {
      alert('System roles cannot be deleted');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const roleColors: Record<string, { bg: string; text: string }> = {
    super_admin: { bg: 'bg-red-500/20', text: 'text-red-400' },
    branch_admin: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
    teacher: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    student: { bg: 'bg-green-500/20', text: 'text-green-400' },
    parent: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    employee: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    front_desk: { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  };

  return (
    <div className="p-8 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-indigo-600" size={28} />
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          </div>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white"
          style={{ backgroundColor: uiConfig.colors.primary['500'] }}
        >
          <Plus size={20} />
          Add Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading roles...</div>
        ) : roles.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No roles found</div>
        ) : (
          roles.map((role) => {
            const colors = roleColors[role.slug] || { bg: 'bg-gray-500/20', text: 'text-gray-400' };
            return (
              <div
                key={role.id}
                className="rounded-lg border p-6 hover:shadow-lg transition bg-white"
                style={{
                  borderColor: uiConfig.colors.primary['200'],
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{role.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.bg} ${colors.text}`}>
                        {role.slug}
                      </span>
                      {role.is_system_role && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                          System
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 hover:bg-gray-100 rounded transition"
                      title="Edit"
                    >
                      <Edit2 size={18} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteRole(role.id, role.is_system_role)}
                      className={`p-2 rounded transition ${
                        role.is_system_role
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-red-100'
                      }`}
                      title={role.is_system_role ? 'Cannot delete system role' : 'Delete'}
                    >
                      <Trash2 size={18} className={role.is_system_role ? 'text-gray-400' : 'text-red-600'} />
                    </button>
                  </div>
                </div>

                {/* Permissions Count */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Permissions</span>
                    <span className="text-lg font-bold text-indigo-600">{role.permission_count}</span>
                  </div>
                  <button
                    className="mt-3 w-full py-2 rounded-lg text-sm font-semibold transition text-white"
                    style={{
                      backgroundColor: uiConfig.colors.primary['500'],
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Manage Permissions
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="rounded-lg border p-6 bg-white" style={{ borderColor: uiConfig.colors.primary['200'] }}>
          <p className="text-gray-600 text-sm mb-2">Total Roles</p>
          <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
        </div>
        <div className="rounded-lg border p-6 bg-white" style={{ borderColor: uiConfig.colors.primary['200'] }}>
          <p className="text-gray-600 text-sm mb-2">System Roles</p>
          <p className="text-3xl font-bold text-blue-600">{roles.filter(r => r.is_system_role).length}</p>
        </div>
        <div className="rounded-lg border p-6 bg-white" style={{ borderColor: uiConfig.colors.primary['200'] }}>
          <p className="text-gray-600 text-sm mb-2">Custom Roles</p>
          <p className="text-3xl font-bold text-purple-600">{roles.filter(r => r.is_custom_role).length}</p>
        </div>
      </div>
    </div>
  );
}
