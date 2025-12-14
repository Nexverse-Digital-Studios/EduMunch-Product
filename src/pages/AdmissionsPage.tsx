import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Loader } from 'lucide-react';
import { uiConfig } from '@/config/ui.config';
import { getStatusTailwindClass } from '@/config/theme-colors';
import { admissionsService, AdmissionRecord } from '@/services/admissions.service';
import { useAuthStore } from '@/store/authStore';

export default function AdmissionsPage() {
  const { user } = useAuthStore();
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAdmission, setShowNewAdmission] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState<AdmissionRecord>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    category: '',
    course_id: '',
    current_school: '',
    current_class: '',
    admission_id: '',
    admission_date: new Date().toISOString().split('T')[0],
    session_year: '',
    tie_up_school: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    status: 'PENDING',
    notes: '',
  });

  // Fetch admissions on mount
  useEffect(() => {
    loadAdmissions();
  }, [user]);

  const loadAdmissions = async () => {
    if (!user?.orgId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await admissionsService.getAdmissions(user.orgId);
    if (error) {
      setError('Failed to load admissions');
      console.error(error);
    } else {
      setAdmissions(data);
    }
    setLoading(false);
  };

  // Filter admissions based on search
  const filteredAdmissions = admissions.filter(
    (admission) =>
      admission.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.admission_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.orgId) return;

    setLoading(true);
    setError(null);

    const admissionData: AdmissionRecord = {
      ...formData,
      org_id: user.orgId,
    };

    if (editingId) {
      const { error } = await admissionsService.updateAdmission(editingId, admissionData);
      if (error) {
        setError('Failed to update admission');
        console.error(error);
      } else {
        setEditingId(null);
        await loadAdmissions();
      }
    } else {
      const { error } = await admissionsService.createAdmission(admissionData);
      if (error) {
        setError('Failed to create admission');
        console.error(error);
      } else {
        await loadAdmissions();
      }
    }

    setShowNewAdmission(false);
    resetForm();
    setLoading(false);
  };

  const handleEditAdmission = (admission: AdmissionRecord) => {
    setFormData(admission);
    setEditingId(admission.id!);
    setShowNewAdmission(true);
  };

  const handleDeleteAdmission = async (id: string) => {
    setDeleting(id);
    const { error } = await admissionsService.deleteAdmission(id);
    if (error) {
      setError('Failed to delete admission');
      console.error(error);
    } else {
      setAdmissions(admissions.filter((a) => a.id !== id));
    }
    setDeleting(null);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      date_of_birth: '',
      gender: '',
      category: '',
      course_id: '',
      current_school: '',
      current_class: '',
      admission_id: '',
      admission_date: new Date().toISOString().split('T')[0],
      session_year: '',
      tie_up_school: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      parent_name: '',
      parent_email: '',
      parent_phone: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      status: 'PENDING',
      notes: '',
    });
    setEditingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return getStatusTailwindClass('ACTIVE', 'admission', 'badge');
      case 'PENDING':
        return getStatusTailwindClass('PENDING', 'admission', 'badge');
      case 'REJECTED':
        return getStatusTailwindClass('REJECTED', 'admission', 'badge');
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admissions Management</h1>
          <p className="text-gray-600 mt-1">Manage student admissions and applications</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowNewAdmission(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all"
          style={{ backgroundColor: uiConfig.colors.primary['500'] }}
        >
          <Plus size={20} />
          New Admission
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, admission ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0"
            style={{ outlineColor: uiConfig.colors.primary['500'] }}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader size={32} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Admission ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No admissions found
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((admission) => (
                  <tr key={admission.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {admission.first_name} {admission.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{admission.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{admission.admission_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(admission.admission_date!).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(admission.status)}`}>
                        {admission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEditAdmission(admission)}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                        disabled={deleting === admission.id}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteAdmission(admission.id!)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        disabled={deleting === admission.id}
                      >
                        {deleting === admission.id ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Admission Modal */}
      {showNewAdmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Admission' : 'New Admission'}
              </h2>
              <button onClick={() => setShowNewAdmission(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleAddAdmission} className="p-6">
              {/* General Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Admission ID"
                    value={formData.admission_id}
                    onChange={(e) => setFormData({ ...formData, admission_id: e.target.value })}
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="date"
                    value={formData.admission_date}
                    onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="text"
                    placeholder="Session Year (e.g., 2025-2026)"
                    value={formData.session_year}
                    onChange={(e) => setFormData({ ...formData, session_year: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                </div>
              </div>

              {/* Student Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>

              {/* Academic Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Current School"
                    value={formData.current_school}
                    onChange={(e) => setFormData({ ...formData, current_school: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="text"
                    placeholder="Current Class"
                    value={formData.current_class}
                    onChange={(e) => setFormData({ ...formData, current_class: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="text"
                    placeholder="Tie-up School"
                    value={formData.tie_up_school}
                    onChange={(e) => setFormData({ ...formData, tie_up_school: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                </div>
              </div>

              {/* Address Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <textarea
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 mb-4"
                  style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  rows={2}
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                </div>
              </div>

              {/* Parent Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent & Emergency Contact</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Parent Name"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="email"
                    placeholder="Parent Email"
                    value={formData.parent_email}
                    onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="tel"
                    placeholder="Parent Phone"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Emergency Contact Name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                  <input
                    type="tel"
                    placeholder="Emergency Contact Phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  />
                </div>
              </div>

              {/* Status & Notes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Notes</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <textarea
                  placeholder="Additional Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ outlineColor: uiConfig.colors.primary['500'] }}
                  rows={3}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4 justify-end border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAdmission(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg text-white font-semibold transition-all disabled:opacity-50"
                  style={{ backgroundColor: uiConfig.colors.primary['500'] }}
                >
                  {loading ? 'Saving...' : editingId ? 'Update Admission' : 'Create Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
