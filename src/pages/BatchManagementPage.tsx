import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader } from 'lucide-react';
import { uiConfig } from '@/config/ui.config';
import { batchesService, Batch } from '@/services/batches.service';
import { branchesService } from '@/services/branches.service';
import { coursesService } from '@/services/courses.service';
import { subjectsService } from '@/services/subjects.service';
import { facultyService } from '@/services/faculty.service';
import { useAuthStore } from '@/store/authStore';

export default function BatchManagementPage() {
  const { user } = useAuthStore();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'subjects' | 'faculty'>('details');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [branches, setBranches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<any[]>([]);
  const [batchFaculty, setBatchFaculty] = useState<any[]>([]);

  const [formData, setFormData] = useState<Batch>({
    branch_id: '',
    course_id: '',
    name: '',
    code: '',
    description: '',
    start_date: '',
    end_date: '',
    capacity: 50,
  });

  useEffect(() => {
    if (user?.orgId) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.orgId) return;
    setLoading(true);
    setError(null);

    try {
      const [batchesRes, branchesRes, coursesRes, subjectsRes] = await Promise.all([
        batchesService.getBatches(user.orgId),
        branchesService.getBranches(user.orgId),
        coursesService.getCourses(user.orgId),
        subjectsService.getSubjects(user.orgId),
      ]);

      if (batchesRes.error) throw batchesRes.error;
      if (branchesRes.error) throw branchesRes.error;
      if (coursesRes.error) throw coursesRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      setBatches(batchesRes.data);
      setBranches(branchesRes.data);
      setCourses(coursesRes.data);
      setSubjects(subjectsRes.data);

      if (batchesRes.data.length > 0 && !selectedBatch) {
        setSelectedBatch(batchesRes.data[0].id);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    }
    setLoading(false);
  };

  const loadBatchDetails = async (batchId: string) => {
    if (!user?.orgId) return;

    const [subjectsRes, facultyRes] = await Promise.all([
      subjectsService.getBatchSubjects(batchId),
      facultyService.getBatchFaculty(batchId),
    ]);

    if (!subjectsRes.error) setBatchSubjects(subjectsRes.data);
    if (!facultyRes.error) setBatchFaculty(facultyRes.data);
  };

  useEffect(() => {
    if (selectedBatch) {
      loadBatchDetails(selectedBatch);
    }
  }, [selectedBatch]);

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.orgId) return;

    setLoading(true);
    try {
      const batchData: Batch = { ...formData, org_id: user.orgId };

      if (editingId) {
        const { error } = await batchesService.updateBatch(editingId, batchData);
        if (error) throw error;
      } else {
        const { error } = await batchesService.createBatch(batchData);
        if (error) throw error;
      }

      await loadData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError('Failed to save batch');
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeleteBatch = async (id: string) => {
    if (!confirm('Delete this batch?')) return;

    const { error } = await batchesService.deleteBatch(id);
    if (error) {
      setError('Failed to delete batch');
    } else {
      await loadData();
    }
  };

  const handleAddSubject = async (subjectId: string) => {
    if (!selectedBatch || !subjectId) return;

    const { error } = await subjectsService.addSubjectToBatch(selectedBatch, subjectId);
    if (error) {
      setError('Failed to add subject');
    } else {
      await loadBatchDetails(selectedBatch);
    }
  };

  const handleRemoveSubject = async (subjectId: string) => {
    if (!selectedBatch) return;

    const { error } = await subjectsService.removeSubjectFromBatch(selectedBatch, subjectId);
    if (error) {
      setError('Failed to remove subject');
    } else {
      await loadBatchDetails(selectedBatch);
    }
  };

  const resetForm = () => {
    setFormData({
      branch_id: '',
      course_id: '',
      name: '',
      code: '',
      description: '',
      start_date: '',
      end_date: '',
      capacity: 50,
    });
    setEditingId(null);
  };

  const currentBatch = batches.find((b) => b.id === selectedBatch);
  const assignedSubjectIds = batchSubjects.map((bs: any) => bs.subject_id);
  const availableSubjects = subjects.filter((s) => !assignedSubjectIds.includes(s.id));

  return (
    <div className="p-6 bg-white dark:bg-dark-surface-primary rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">Batch Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold"
        >
          <Plus size={20} /> Create Batch
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size={32} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {/* Batch List Sidebar */}
          <div className="border border-gray-200 dark:border-dark-border-primary rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-dark-border-primary">
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Batches</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {batches.map((batch) => (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatch(batch.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-dark-border-primary hover:bg-gray-50 dark:hover:bg-dark-surface-secondary transition-colors ${
                    selectedBatch === batch.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-600 dark:border-l-indigo-500' : ''
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-dark-text-primary">{batch.name}</div>
                  <div className="text-sm text-gray-600 dark:text-dark-text-secondary">{batch.code}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-3">
            {currentBatch ? (
              <div>
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-dark-border-primary">
                  {['details', 'subjects', 'faculty'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-3 px-2 font-semibold capitalize border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary'
                      }`}
                    >
                      {tab === 'subjects' ? 'Manage Subjects' : tab === 'faculty' ? 'Manage Faculty' : 'Batch Details'}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">Batch Name</label>
                        <input
                          type="text"
                          value={currentBatch.name}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">Batch Code</label>
                        <input
                          type="text"
                          value={currentBatch.code}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">Branch</label>
                      <input
                        type="text"
                        value={currentBatch.branch?.name || 'N/A'}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">Course</label>
                      <input
                        type="text"
                        value={currentBatch.course?.name || 'N/A'}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">Start Date</label>
                        <input
                          type="date"
                          value={currentBatch.start_date}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">End Date</label>
                        <input
                          type="date"
                          value={currentBatch.end_date}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">Capacity</label>
                      <input
                        type="number"
                        value={currentBatch.capacity}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => {
                          setFormData(currentBatch);
                          setEditingId(currentBatch.id);
                          setShowModal(true);
                        }}
                        className="px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold"
                      >
                        <Edit2 size={18} className="inline mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(currentBatch.id)}
                        className="px-4 py-2 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 size={18} className="inline mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'subjects' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">Add Subject</label>
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => e.target.value && handleAddSubject(e.target.value)}
                          defaultValue=""
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Subject to Add</option>
                          {availableSubjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-3">Assigned Subjects ({batchSubjects.length})</h4>
                      <div className="space-y-2">
                        {batchSubjects.length === 0 ? (
                          <p className="text-gray-500 dark:text-dark-text-secondary">No subjects assigned</p>
                        ) : (
                          batchSubjects.map((bs: any) => (
                            <div key={bs.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-surface-secondary rounded-lg">
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-dark-text-primary">{bs.subject?.name}</div>
                                <div className="text-sm text-gray-600 dark:text-dark-text-secondary">{bs.subject?.code}</div>
                              </div>
                              <button
                                onClick={() => handleRemoveSubject(bs.subject_id)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'faculty' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-3">Assigned Faculty ({batchFaculty.length})</h4>
                      <div className="space-y-2">
                        {batchFaculty.length === 0 ? (
                          <p className="text-gray-500 dark:text-dark-text-secondary">No faculty assigned</p>
                        ) : (
                          batchFaculty.map((bf: any) => (
                            <div key={bf.id} className="p-3 bg-gray-50 dark:bg-dark-surface-secondary rounded-lg">
                              <div className="flex justify-between">
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-dark-text-primary">
                                    {bf.faculty?.first_name} {bf.faculty?.last_name}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-dark-text-secondary">{bf.subject?.name}</div>
                                </div>
                                <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-dark-text-secondary">No batch selected</div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg w-full max-w-md border border-gray-200 dark:border-dark-border-primary">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-dark-border-primary">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                {editingId ? 'Edit Batch' : 'Create Batch'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 dark:text-dark-text-secondary">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Batch Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Batch Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary font-semibold text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-surface-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


