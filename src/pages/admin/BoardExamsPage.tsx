import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { boardExamService } from "@/services/boardExamService";
import { Plus, Trash2, Edit2, Search } from "lucide-react";

export default function BoardExamsPage() {
  const { user } = useAuthStore();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("templates");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    exam_name: "",
    exam_type: "BOARD",
    max_marks: "",
    exam_date: "",
  });

  useEffect(() => {
    if (user?.orgId) {
      fetchExams();
    }
  }, [user?.orgId]);

  const fetchExams = async () => {
    setLoading(true);
    const { data } = await boardExamService.getBoardExams(user);
    setExams(data || []);
    setLoading(false);
  };

  const handleCreateExam = async () => {
    if (!formData.exam_name) {
      alert("Please fill all required fields");
      return;
    }

    const { error } = await boardExamService.createBoardExam(user, {
      exam_name: formData.exam_name,
      exam_type: formData.exam_type,
      max_marks: formData.max_marks ? parseInt(formData.max_marks) : undefined,
      exam_date: formData.exam_date || undefined,
    });

    if (!error) {
      setShowModal(false);
      setFormData({
        exam_name: "",
        exam_type: "BOARD",
        max_marks: "",
        exam_date: "",
      });
      fetchExams();
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      await boardExamService.deleteBoardExam(user, examId);
      fetchExams();
    }
  };

  const filteredExams = exams.filter((exam) =>
    exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">Board Exams</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> New Exam
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-dark-border-primary">
        {["templates", "tests", "marks"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400 dark:text-dark-text-secondary" size={20} />
        <input
          type="text"
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-primary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === "templates" && (
        <div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500 dark:text-dark-text-secondary">Loading...</div>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-dark-text-secondary">
              No exams found. Create your first exam.
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow overflow-hidden border border-gray-200 dark:border-dark-border-primary">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-surface-secondary border-b border-gray-200 dark:border-dark-border-primary">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-dark-text-primary">
                      Exam Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-dark-text-primary">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-dark-text-primary">
                      Max Marks
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-dark-text-primary">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-600 dark:text-dark-text-primary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border-primary">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface-secondary">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        {exam.exam_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 rounded-full text-xs font-medium">
                          {exam.exam_type || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                        {exam.max_marks || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                        {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <Trash2 size={18} />
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
      )}

      {activeTab === "tests" && (
        <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-8 text-center text-gray-500 dark:text-dark-text-secondary border border-gray-200 dark:border-dark-border-primary">
          Test management coming soon...
        </div>
      )}

      {activeTab === "marks" && (
        <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-8 text-center text-gray-500 dark:text-dark-text-secondary border border-gray-200 dark:border-dark-border-primary">
          Marks entry coming soon...
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow-lg p-6 w-96 border border-gray-200 dark:border-dark-border-primary">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-dark-text-primary">Create New Exam</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  Exam Name *
                </label>
                <input
                  type="text"
                  value={formData.exam_name}
                  onChange={(e) =>
                    setFormData({ ...formData, exam_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Mid Term Exam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  Exam Type
                </label>
                <select
                  value={formData.exam_type}
                  onChange={(e) =>
                    setFormData({ ...formData, exam_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="BOARD">Board</option>
                  <option value="INTERNAL">Internal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  Max Marks
                </label>
                <input
                  type="number"
                  value={formData.max_marks}
                  onChange={(e) =>
                    setFormData({ ...formData, max_marks: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) =>
                    setFormData({ ...formData, exam_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-secondary text-gray-700 dark:text-dark-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateExam}
                className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
