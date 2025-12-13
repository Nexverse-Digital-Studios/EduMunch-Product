import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { salaryStructureService } from "@/services/salaryStructureService";
import { Plus, Trash2, Edit2 } from "lucide-react";

export default function SalaryStructuresPage() {
  const { user } = useAuthStore();
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<any>(null);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    base_salary: "",
    description: "",
  });
  const [deductions, setDeductions] = useState<any[]>([]);

  useEffect(() => {
    if (user?.orgId) {
      fetchStructures();
    }
  }, [user?.orgId]);

  const fetchStructures = async () => {
    setLoading(true);
    const { data } = await salaryStructureService.getSalaryStructures(user);
    setStructures(data || []);
    setLoading(false);
  };

  const handleCreateStructure = async () => {
    if (!formData.title) {
      alert("Please fill all required fields");
      return;
    }

    const { data, error } = await salaryStructureService.createSalaryStructure(
      user,
      {
        title: formData.title,
        base_salary: parseFloat(formData.base_salary) || 0,
        description: formData.description,
      }
    );

    if (!error && data) {
      // Add earnings
      for (const earning of earnings) {
        if (earning.earning_name && earning.amount) {
          await salaryStructureService.addEarning(user, {
            salary_structure_id: data.id,
            earning_name: earning.earning_name,
            amount: parseFloat(earning.amount),
          });
        }
      }

      // Add deductions
      for (const deduction of deductions) {
        if (deduction.deduction_name && deduction.amount) {
          await salaryStructureService.addDeduction(user, {
            salary_structure_id: data.id,
            deduction_name: deduction.deduction_name,
            amount: parseFloat(deduction.amount),
          });
        }
      }

      setShowModal(false);
      setFormData({ title: "", base_salary: "", description: "" });
      setEarnings([]);
      setDeductions([]);
      fetchStructures();
    }
  };

  const handleDeleteStructure = async (structureId: string) => {
    if (window.confirm("Are you sure you want to delete this structure?")) {
      await salaryStructureService.deleteSalaryStructure(user, structureId);
      fetchStructures();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Salary Structures</h1>
        <button
          onClick={() => {
            setSelectedStructure(null);
            setFormData({ title: "", base_salary: "", description: "" });
            setEarnings([]);
            setDeductions([]);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} /> New Structure
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : structures.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No salary structures found. Create your first structure.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {structures.map((structure) => (
            <div
              key={structure.id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {structure.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {structure.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteStructure(structure.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-4 mb-4">
                <p className="text-sm text-gray-600">Base Salary</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹ {structure.base_salary?.toLocaleString() || 0}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Earnings
                  </h4>
                  <button className="text-sm text-blue-600 hover:text-blue-900">
                    + View Details
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Deductions
                  </h4>
                  <button className="text-sm text-blue-600 hover:text-blue-900">
                    + View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">
              {selectedStructure ? "Edit Salary Structure" : "Create Salary Structure"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Structure Name *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Teacher"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Salary
                </label>
                <input
                  type="number"
                  value={formData.base_salary}
                  onChange={(e) =>
                    setFormData({ ...formData, base_salary: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                />
              </div>

              {/* Earnings Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Earnings</h3>
                <div className="space-y-3 mb-4">
                  {earnings.map((earning, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={earning.earning_name}
                        onChange={(e) => {
                          const updated = [...earnings];
                          updated[idx].earning_name = e.target.value;
                          setEarnings(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={earning.amount}
                        onChange={(e) => {
                          const updated = [...earnings];
                          updated[idx].amount = e.target.value;
                          setEarnings(updated);
                        }}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setEarnings(earnings.filter((_, i) => i !== idx));
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setEarnings([...earnings, { earning_name: "", amount: "" }])
                  }
                  className="text-sm text-blue-600 hover:text-blue-900"
                >
                  + Add Earning Component
                </button>
              </div>

              {/* Deductions Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Deductions</h3>
                <div className="space-y-3 mb-4">
                  {deductions.map((deduction, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={deduction.deduction_name}
                        onChange={(e) => {
                          const updated = [...deductions];
                          updated[idx].deduction_name = e.target.value;
                          setDeductions(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={deduction.amount}
                        onChange={(e) => {
                          const updated = [...deductions];
                          updated[idx].amount = e.target.value;
                          setDeductions(updated);
                        }}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setDeductions(
                            deductions.filter((_, i) => i !== idx)
                          );
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setDeductions([
                      ...deductions,
                      { deduction_name: "", amount: "" },
                    ])
                  }
                  className="text-sm text-blue-600 hover:text-blue-900"
                >
                  + Add Deduction Component
                </button>
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
                onClick={handleCreateStructure}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedStructure ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
