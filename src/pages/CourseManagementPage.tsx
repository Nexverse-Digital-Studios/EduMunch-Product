import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader } from 'lucide-react';
import { uiConfig } from '@/config/ui.config';
import { coursesService, Course } from '@/services/courses.service';
import { useAuthStore } from '@/store/authStore';

export default function CourseManagementPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Course>({
    name: '',
    code: '',
    description: '',
    duration_months: 12,
    level: '',
    category: '',
  });

  useEffect(() => {
    if (user?.orgId) loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user?.orgId) return;
    setLoading(true);
    const { data, error } = await coursesService.getCourses(user.orgId);
    if (error) {
      setError('Failed to load courses');
    } else {
      setCourses(data);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.orgId) return;

    try {
      const courseData: Course = { ...formData, org_id: user.orgId };
      if (editingId) {
        await coursesService.updateCourse(editingId, courseData);
      } else {
        await coursesService.createCourse(courseData);
      }
      await loadCourses();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError('Failed to save course');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    const { error } = await coursesService.deleteCourse(id);
    if (error) {
      setError('Failed to delete course');
    } else {
      await loadCourses();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      duration_months: 12,
      level: '',
      category: '',
    });
    setEditingId(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold"
          style={{ backgroundColor: uiConfig.colors.primary['500'] }}
        >
          <Plus size={20} /> Add Course
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
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Course Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No courses found
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{course.name}</td>
                    <td className="px-6 py-4 text-gray-600">{course.code}</td>
                    <td className="px-6 py-4 text-gray-600">{course.level || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{course.category || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{course.duration_months} months</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => {
                          setFormData(course);
                          setEditingId(course.id);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Course' : 'Create Course'}</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Course Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Course Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
              <input
                type="text"
                placeholder="Level (e.g., Foundation, Advanced)"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Category (e.g., JEE, NEET)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Duration (months)"
                value={formData.duration_months}
                onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: uiConfig.colors.primary['500'] }}
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
