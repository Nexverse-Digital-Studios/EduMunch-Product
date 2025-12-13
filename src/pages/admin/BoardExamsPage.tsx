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
        <h1 className="text-3xl font-bold text-gray-900">Board Exams</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} /> New Exam
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {["templates", "tests", "marks"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === "templates" && (
        <div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No exams found. Create your first exam.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                      Exam Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                      Max Marks
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {exam.exam_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {exam.exam_type || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exam.max_marks || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="text-red-600 hover:text-red-900"
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
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Test management coming soon...
        </div>
      )}

      {activeTab === "marks" && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Marks entry coming soon...
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Create New Exam</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Name *
                </label>
                <input
                  type="text"
                  value={formData.exam_name}
                  onChange={(e) =>
                    setFormData({ ...formData, exam_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mid Term Exam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Type
                </label>
                <select
                  value={formData.exam_type}
                  onChange={(e) =>
                    setFormData({ ...formData, exam_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BOARD">Board</option>
                  <option value="INTERNAL">Internal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Marks
                </label>
                <input
                  type="number"
                  value={formData.max_marks}
                  onChange={(e) =>
                    setFormData({ ...formData, max_marks: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) =>
                    setFormData({ ...formData, exam_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateExam}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
