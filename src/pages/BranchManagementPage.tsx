import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader } from 'lucide-react';
import { uiConfig } from '@/config/ui.config';
import { branchesService, Branch } from '@/services/branches.service';
import { useAuthStore } from '@/store/authStore';

export default function BranchManagementPage() {
  const { user } = useAuthStore();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Branch>({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    phone_number: '',
    email: '',
  });

  useEffect(() => {
    if (user?.orgId) loadBranches();
  }, [user]);

  const loadBranches = async () => {
    if (!user?.orgId) return;
    setLoading(true);
    const { data, error } = await branchesService.getBranches(user.orgId);
    if (error) {
      setError('Failed to load branches');
    } else {
      setBranches(data);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.orgId) return;

    try {
      const branchData: Branch = { ...formData, org_id: user.orgId };
      if (editingId) {
        await branchesService.updateBranch(editingId, branchData);
      } else {
        await branchesService.createBranch(branchData);
      }
      await loadBranches();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError('Failed to save branch');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this branch?')) return;
    const { error } = await branchesService.deleteBranch(id);
    if (error) {
      setError('Failed to delete branch');
    } else {
      await loadBranches();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      phone_number: '',
      email: '',
    });
    setEditingId(null);
  };

  return (
    <div className="p-6 bg-white dark:bg-dark-surface-primary rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">Branch Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold"
        >
          <Plus size={20} /> Add Branch
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size={32} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-surface-secondary">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Branch Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Address</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">City</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-dark-text-secondary">
                    No branches found
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.id} className="border-b border-gray-200 dark:border-dark-border-primary hover:bg-gray-50 dark:hover:bg-dark-surface-secondary">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-dark-text-primary">{branch.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-dark-text-secondary">{branch.code}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-dark-text-secondary">{branch.address || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-dark-text-secondary">{branch.city || '-'}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => {
                          setFormData(branch);
                          setEditingId(branch.id);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-surface-primary rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-dark-border-primary">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-dark-border-primary sticky top-0 bg-white dark:bg-dark-surface-primary">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">{editingId ? 'Edit Branch' : 'Add Branch'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Branch Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-surface-primary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


