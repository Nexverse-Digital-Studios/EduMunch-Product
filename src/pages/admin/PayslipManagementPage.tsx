import { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { payslipService, Payslip } from '@/services/payslipService';

export function PayslipManagementPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'generate' | 'view'>('generate');
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Mock employees data
  const [employees] = useState([
    { id: '1', name: 'Rajesh Kumar', code: 'EMP001', salary: 50000 },
    { id: '2', name: 'Priya Singh', code: 'EMP002', salary: 55000 },
    { id: '3', name: 'Amit Patel', code: 'EMP003', salary: 45000 },
    { id: '4', name: 'Neha Gupta', code: 'EMP004', salary: 60000 },
    { id: '5', name: 'Vikram Sharma', code: 'EMP005', salary: 52000 },
  ]);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  useEffect(() => {
    if (activeTab === 'view' && user && selectedMonth && selectedYear) {
      loadPayslips();
    }
  }, [activeTab, user, selectedMonth, selectedYear]);

  const loadPayslips = async () => {
    if (!user || !selectedMonth || !selectedYear) return;
    try {
      setLoading(true);
      const payrollMonth = `${selectedYear}-${selectedMonth}`;
      const data = await payslipService.getPayslipsByMonth(user, payrollMonth);
      setPayslips(data);
    } catch (error) {
      console.error('Error loading payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslips = async () => {
    if (!user || !selectedMonth || !selectedYear || selectedEmployees.length === 0) {
      alert('Please select month, year, and at least one employee');
      return;
    }

    try {
      setLoading(true);
      const basicSalaries: Record<string, number> = {};
      selectedEmployees.forEach(empId => {
        const emp = employees.find(e => e.id === empId);
        if (emp) basicSalaries[empId] = emp.salary;
      });

      await payslipService.generatePayslips(user, selectedMonth, parseInt(selectedYear), selectedEmployees, basicSalaries);
      
      // Clear selection and switch to view tab
      setSelectedEmployees([]);
      setActiveTab('view');
      loadPayslips();
    } catch (error) {
      console.error('Error generating payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayslip = async (id: string) => {
    if (!user) return;
    if (!confirm('Are you sure?')) return;

    try {
      await payslipService.deletePayslip(user, id);
      loadPayslips();
    } catch (error) {
      console.error('Error deleting payslip:', error);
    }
  };

  const toggleEmployee = (empId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleDownloadPayslip = (payslip: Payslip) => {
    // Mock download - in real app would generate PDF
    alert(`Downloading payslip for ${payslip.employee_name || 'Employee'}`);
  };

  const handleViewPayslip = (payslip: Payslip) => {
    alert(`View details: Net Salary ₹${payslip.net_salary}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Payslip Management</h1>

        {/* Tabs */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow mb-6 border-b border-gray-200 dark:border-dark-border-primary">
          <div className="flex">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 px-6 py-3 font-medium text-center border-b-2 transition ${
                activeTab === 'generate'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-600 dark:text-dark-text-secondary border-transparent hover:text-gray-900 dark:hover:text-dark-text-primary'
              }`}
            >
              <Plus className="inline mr-2" size={18} /> Generate Payslips
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 px-6 py-3 font-medium text-center border-b-2 transition ${
                activeTab === 'view'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-600 dark:text-dark-text-secondary border-transparent hover:text-gray-900 dark:hover:text-dark-text-primary'
              }`}
            >
              <Eye className="inline mr-2" size={18} /> View Generated
            </button>
          </div>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6">
            <div className="space-y-6">
              {/* Month/Year Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white"
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Year</label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white"
                    min={2020}
                    max={2050}
                  />
                </div>
              </div>

              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-3">Select Employees</label>
                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 dark:border-dark-border-primary rounded-lg p-4 bg-gray-50 dark:bg-dark-surface-secondary">
                  {mockEmployees.map((emp) => (
                    <label key={emp.id} className="flex items-center gap-3 p-3 bg-white dark:bg-dark-surface-primary rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-secondary cursor-pointer border border-gray-200 dark:border-dark-border-primary">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                        className="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-dark-border-primary rounded bg-white dark:bg-dark-surface-primary"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{emp.name}</div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">{emp.code} • ₹{emp.salary.toLocaleString()}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleGeneratePayslips}
                  disabled={!selectedMonth || !selectedYear || selectedEmployees.length === 0 || loading}
                  className="flex-1 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Generate Payslips ({selectedEmployees.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Tab */}
        {activeTab === 'view' && (
          <div className="space-y-4">
            {/* Month/Year Filter */}
            <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-4 grid grid-cols-2 gap-4 border border-gray-200 dark:border-dark-border-primary">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white"
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Year</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white"
                  min={2020}
                  max={2050}
                />
              </div>
            </div>

            {/* Payslips List */}
            {loading ? (
              <div className="text-center py-12 text-gray-900 dark:text-white">Loading payslips...</div>
            ) : payslips.length > 0 ? (
              <div className="space-y-3">
                {payslips.map(payslip => (
                  <div key={payslip.id} className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-4 border border-gray-200 dark:border-dark-border-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{payslip.employee_name || 'Employee'}</h3>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600 dark:text-slate-400">
                          <div>
                            <span className="font-medium">Net Salary:</span> ₹{payslip.net_salary?.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Payment Date:</span> {payslip.payment_date ? new Date(payslip.payment_date).toLocaleDateString() : 'Pending'}
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              payslip.status === 'FINALIZED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payslip.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewPayslip(payslip)}
                          className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                          title="View Payslip"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadPayslip(payslip)}
                          className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                          title="Download Payslip"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePayslip(payslip.id)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                          title="Delete Payslip"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No payslips found for selected month
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
