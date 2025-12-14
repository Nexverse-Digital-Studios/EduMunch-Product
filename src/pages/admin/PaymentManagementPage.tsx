import { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getStatusTailwindClass } from '@/config/theme-colors';
import { paymentService } from '@/services/paymentService';

export function PaymentManagementPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'search' | 'filter' | 'outstanding'>('search');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [balanceInfo, setBalanceInfo] = useState({ totalDue: 0, totalPaid: 0, balance: 0 });
  const [installments, setInstallments] = useState<any[]>([]);

  // Mock students data
  const [students] = useState([
    { id: '1', name: 'John Doe', formNumber: 'STU001', course: 'BTech' },
    { id: '2', name: 'Jane Smith', formNumber: 'STU002', course: 'BCA' },
    { id: '3', name: 'Bob Johnson', formNumber: 'STU003', course: 'BBA' },
  ]);

  useEffect(() => {
    if (user && selectedStudent) {
      loadStudentPayments();
    }
  }, [user, selectedStudent, activeTab]);

  const loadStudentPayments = async () => {
    if (!user || !selectedStudent) return;
    try {
      setLoading(true);

      // Load balance
      const balance = await paymentService.calculateStudentBalance(user, selectedStudent);
      setBalanceInfo(balance);

      // Load installments
      const inst = await paymentService.getInstallments(user, selectedStudent);
      setInstallments(inst);

      // Load payments
      const pmnts = await paymentService.getPaymentsByAdmission(user, selectedStudent);
      setPayments(pmnts);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (installmentId: string) => {
    if (!user) return;
    try {
      const amount = prompt('Enter payment amount:');
      if (amount) {
        await paymentService.updateInstallmentPaidAmount(user, installmentId, parseFloat(amount));
        loadStudentPayments();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const handleSendReminder = (studentId: string) => {
    alert(`Reminder sent to student ${studentId}`);
  };

  const getStatusBadge = (status: string, method?: string) => {
    const displayStatus = method || status;
    const tailwindClass = getStatusTailwindClass(displayStatus, 'payment', 'badge');
    
    return <span className={`px-3 py-1 text-xs font-medium rounded-full ${tailwindClass}`}>{status}</span>;
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Payment Management</h1>

        {/* Student Selection */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-dark-border-primary">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">Select Student/Admission</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
          >
            <option value="">Choose a student...</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.formNumber}) - {student.course}
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && selectedStudentData && (
          <>
            {/* Balance Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6 border border-indigo-200 dark:border-indigo-500">
                <div className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Total Due</div>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">₹{balanceInfo.totalDue.toFixed(2)}</div>
              </div>
              <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6 border border-green-200 dark:border-green-500">
                <div className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Total Paid</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">₹{balanceInfo.totalPaid.toFixed(2)}</div>
              </div>
              <div className={`bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6 border-2 ${balanceInfo.balance > 0 ? 'border-red-200 dark:border-red-500' : 'border-green-200 dark:border-green-500'}`}>
                <div className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Balance</div>
                <div className={`text-3xl font-bold ${balanceInfo.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  ₹{balanceInfo.balance.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow mb-6 border-b border-gray-200 dark:border-dark-border-primary">
              <div className="flex">
                {['search', 'filter', 'outstanding'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 px-6 py-3 font-medium text-center border-b-2 transition ${
                      activeTab === tab
                        ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                        : 'text-gray-600 dark:text-dark-text-secondary border-transparent hover:text-gray-900 dark:hover:text-dark-text-primary'
                    }`}
                  >
                    {tab === 'search' && <Search className="inline mr-2" size={18} />}
                    {tab === 'filter' && <Filter className="inline mr-2" size={18} />}
                    {tab === 'outstanding' && <AlertCircle className="inline mr-2" size={18} />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="text-center py-12 text-gray-900 dark:text-dark-text-primary">Loading...</div>
            ) : activeTab === 'search' ? (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4">Transaction History</h3>
                {payments.length > 0 ? (
                  payments.map(payment => (
                    <div key={payment.id} className="bg-white dark:bg-dark-surface-primary rounded-lg p-4 border border-gray-200 dark:border-dark-border-primary">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">{payment.student_name}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Amount: ₹{payment.amount}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(payment.payment_method || 'CASH')}
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Date: {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">No payments recorded</div>
                )}
              </div>
            ) : activeTab === 'filter' ? (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4">Installment Plan</h3>
                {installments.length > 0 ? (
                  installments.map(installment => (
                    <div key={installment.id} className="bg-white dark:bg-dark-surface-primary rounded-lg p-4 border border-gray-200 dark:border-dark-border-primary">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Installment {installment.installment_number}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Due: {new Date(installment.due_date).toLocaleDateString()}</p>
                        </div>
                        {getStatusBadge(installment.status)}
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-dark-text-secondary">Amount: </span>
                          <span className="font-medium">₹{installment.amount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-dark-text-secondary">Paid: </span>
                          <span className="font-medium">₹{installment.paid_amount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-dark-text-secondary">Balance: </span>
                          <span className="font-medium">₹{installment.amount - installment.paid_amount}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRecordPayment(installment.id)}
                          className="flex-1 px-3 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 text-sm"
                        >
                          Record Payment
                        </button>
                        <button
                          onClick={() => handleSendReminder(selectedStudent)}
                          className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                        >
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">No installments configured</div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary mb-4">Outstanding Report</h3>
                {installments.filter(i => i.status !== 'FULLY_PAID').length > 0 ? (
                  installments.filter(i => i.status !== 'FULLY_PAID').map(installment => (
                    <div key={installment.id} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-red-900 dark:text-red-400">Installment {installment.installment_number}</h4>
                          <p className="text-sm text-red-700 dark:text-red-300">Overdue Amount: ₹{installment.amount - installment.paid_amount}</p>
                          <p className="text-xs text-red-600 dark:text-red-400">Due Date: {new Date(installment.due_date).toLocaleDateString()}</p>
                        </div>
                        {getStatusBadge(installment.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">No outstanding payments</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

