import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { uiConfig } from '@/config/ui.config';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  email: string;
  display_name: string;
  role_id: string;
  org_id: string;
  is_active: boolean;
  created_at: string;
  roles?: { name: string };
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          display_name,
          role_id,
          org_id,
          is_active,
          created_at,
          roles(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data as any) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role_id === filterRole;
    return matchesSearch && matchesRole;
  });

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-dark-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          </div>
          <p className="text-gray-600 dark:text-slate-400">Manage users, roles, and permissions</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#334155] border border-gray-200 dark:border-[#334155] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-[#334155] border border-gray-200 dark:border-[#334155] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {/* Users Table */}
      <div
        className="rounded-lg border border-indigo-200 dark:border-indigo-800 overflow-hidden bg-white dark:bg-[#1E293B]"
      >
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#334155]">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Joined</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#334155] transition">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{user.display_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-400">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      >
                        {(user.roles as any)?.name || 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-[#334155] rounded transition"
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? (
                            <Eye size={18} className="text-gray-600 dark:text-gray-400" />
                          ) : (
                            <EyeOff size={18} className="text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-[#334155] rounded transition"
                          title="Edit"
                        >
                          <Edit2 size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 p-6 bg-white dark:bg-[#1E293B]">
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-2">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
        </div>
        <div className="rounded-lg border border-green-200 dark:border-green-800 p-6 bg-white dark:bg-[#1E293B]">
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-2">Active Users</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{users.filter(u => u.is_active).length}</p>
        </div>
        <div className="rounded-lg border border-red-200 dark:border-red-800 p-6 bg-white dark:bg-[#1E293B]">
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-2">Inactive Users</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{users.filter(u => !u.is_active).length}</p>
        </div>
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 p-6 bg-white dark:bg-[#1E293B]">
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-2">Last Updated</p>
          <p className="text-lg font-bold text-gray-700 dark:text-white">
            {users.length > 0 ? new Date(users[0].created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

