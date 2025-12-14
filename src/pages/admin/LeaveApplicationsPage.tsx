import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getStatusTailwindClass } from '@/config/theme-colors';
import { leaveService } from '@/services/leaveService';

export function LeaveApplicationsPage() {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'CASUAL',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const leaveTypes = ['CASUAL', 'SICK', 'EARNED', 'UNPAID', 'MATERNITY'];

  useEffect(() => {
    if (user) {
      loadLeaves();
    }
  }, [user, statusFilter, leaveTypeFilter, dateRange]);

  const loadLeaves = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (leaveTypeFilter) filters.leave_type = leaveTypeFilter;
      if (dateRange.from) filters.start_date = dateRange.from;
      if (dateRange.to) filters.end_date = dateRange.to;

      const data = await leaveService.getLeaveApplications(user, filters);
      setLeaves(data);
    } catch (error) {
      console.error('Error loading leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Calculate duration
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      await leaveService.createLeaveApplication(user, {
        ...formData,
        duration_days: duration,
        status: 'PENDING',
      });

      setFormData({
        employee_id: '',
        leave_type: 'CASUAL',
        start_date: '',
        end_date: '',
        reason: '',
      });
      setShowForm(false);
      loadLeaves();
    } catch (error) {
      console.error('Error creating leave:', error);
    }
  };

  const handleApprove = async (id: string) => {
    if (!user) return;
    try {
      await leaveService.approveLeave(user, id, leaveTypeFilter || 'CASUAL');
      loadLeaves();
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleReject = async (id: string) => {
    if (!user) return;
    try {
      await leaveService.rejectLeave(user, id, 'Rejected by admin');
      loadLeaves();
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      leave.reason?.toLowerCase().includes(searchLower) ||
      leave.leave_type?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return getStatusTailwindClass('PENDING', 'leave', 'bg');
      case 'APPROVED':
        return getStatusTailwindClass('APPROVED', 'leave', 'bg');
      case 'REJECTED':
        return getStatusTailwindClass('REJECTED', 'leave', 'bg');
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className={`px-3 py-1 ${getStatusTailwindClass('PENDING', 'leave', 'badge')} rounded-full text-sm font-medium`}>PENDING</span>;
      case 'APPROVED':
        return <span className={`px-3 py-1 ${getStatusTailwindClass('APPROVED', 'leave', 'badge')} rounded-full text-sm font-medium`}>APPROVED</span>;
      case 'REJECTED':
        return <span className={`px-3 py-1 ${getStatusTailwindClass('REJECTED', 'leave', 'badge')} rounded-full text-sm font-medium`}>REJECTED</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">Leave Applications</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            <Plus size={20} /> New Application
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow-lg p-6 mb-6 border border-indigo-200 dark:border-indigo-500">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-dark-text-primary">Create Leave Application</h2>
            <form onSubmit={handleCreateLeave} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Employee</label>
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Leave Type</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                >
                  {leaveTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">From Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">To Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                  rows={2}
                />
              </div>
              <div className="col-span-2 flex gap-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600">
                  Create Leave
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary rounded-lg hover:bg-gray-400 dark:hover:bg-dark-surface-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-4 mb-6 flex gap-4 flex-wrap border border-gray-200 dark:border-dark-border-primary">
          <div className="flex-1 min-w-250px">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 dark:text-dark-text-secondary" size={20} />
              <input
                type="text"
                placeholder="Search by name, ID or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
          >
            <option value="">All Types</option>
            {leaveTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            placeholder="From Date"
            className="px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
          />

          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            placeholder="To Date"
            className="px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading leaves...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map(leave => (
                <div
                  key={leave.id}
                  className={`border rounded-lg p-4 ${getStatusColor(leave.status)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                          {leave.employee_name || 'Employee'} - {leave.leave_type}
                        </h3>
                        {getStatusBadge(leave.status)}
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-700 dark:text-dark-text-secondary">
                        <div>
                          <span className="font-medium">From:</span> {new Date(leave.start_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">To:</span> {new Date(leave.end_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Days:</span> {leave.duration_days}
                        </div>
                        <div>
                          <span className="font-medium">Deducted As:</span> {leave.deducted_as || '-'}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700 dark:text-dark-text-secondary">
                        <span className="font-medium">Reason:</span> {leave.reason}
                      </div>
                    </div>

                    {leave.status === 'PENDING' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(leave.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(leave.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No leave applications found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
