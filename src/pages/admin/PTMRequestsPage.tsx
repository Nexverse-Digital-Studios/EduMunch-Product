import React, { useState, useEffect } from 'react';
import { Plus, X, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getStatusTailwindClass } from '@/config/theme-colors';
import { ptmService, PTMRequest } from '@/services/ptmService';

export function PTMRequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<PTMRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'AWAITING_PARENT' | 'APPROVED' | 'DECLINED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PTMRequest | null>(null);
  const [actionMode, setActionMode] = useState<'approve' | 'reject' | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  // Mock data
  const [parents] = useState([
    { id: '1', name: 'Mr. Rajesh Kumar' },
    { id: '2', name: 'Mrs. Priya Singh' },
    { id: '3', name: 'Mr. Amit Patel' },
  ]);

  const [teachers] = useState([
    { id: '1', name: 'Dr. John Smith' },
    { id: '2', name: 'Ms. Sarah Johnson' },
    { id: '3', name: 'Mr. Mike Davis' },
  ]);

  const [students] = useState([
    { id: '1', name: 'Rohan Kumar' },
    { id: '2', name: 'Aisha Singh' },
    { id: '3', name: 'Bhuvanesh Patel' },
  ]);

  const [formData, setFormData] = useState({
    parent_id: '',
    parent_name: '',
    teacher_id: '',
    teacher_name: '',
    student_id: '',
    reason: '',
    preferred_time: '',
  });

  const statusTabs = [
    { status: 'PENDING', label: 'Pending', color: 'yellow' },
    { status: 'AWAITING_PARENT', label: 'Awaiting Parent', color: 'blue' },
    { status: 'APPROVED', label: 'Approved', color: 'green' },
    { status: 'DECLINED', label: 'Declined', color: 'red' },
  ];

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user, activeTab]);

  const loadRequests = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await ptmService.getPTMRequestsByStatus(user, activeTab);
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePTM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const parentData = parents.find(p => p.id === formData.parent_id);
      const teacherData = teachers.find(t => t.id === formData.teacher_id);

      await ptmService.createPTMRequest(user, {
        parent_id: formData.parent_id,
        parent_name: parentData?.name,
        teacher_id: formData.teacher_id,
        teacher_name: teacherData?.name,
        student_id: formData.student_id,
        reason: formData.reason,
        preferred_time: formData.preferred_time,
        status: 'PENDING',
      });

      setFormData({
        parent_id: '',
        parent_name: '',
        teacher_id: '',
        teacher_name: '',
        student_id: '',
        reason: '',
        preferred_time: '',
      });
      setShowCreateModal(false);
      loadRequests();
    } catch (error) {
      console.error('Error creating PTM request:', error);
    }
  };

  const handleApproveRequest = async (request: PTMRequest) => {
    if (!user) return;
    try {
      const scheduledTime = prompt('Enter scheduled time (YYYY-MM-DD HH:MM):');
      if (scheduledTime) {
        await ptmService.approvePTMRequest(user, request.id, scheduledTime, actionNotes);
        setActionMode(null);
        setActionNotes('');
        loadRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (request: PTMRequest) => {
    if (!user) return;
    try {
      await ptmService.declinePTMRequest(user, request.id, actionNotes);
      setActionMode(null);
      setActionNotes('');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      req.parent_name?.toLowerCase().includes(searchLower) ||
      req.teacher_name?.toLowerCase().includes(searchLower) ||
      req.reason?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    const statusKey = status.toLowerCase().replace(/\s/g, '_');
    const bg = getStatusTailwindClass(statusKey, 'ptmRequest', 'bg');
    return bg;
  };

  const getStatusBadge = (status: string) => {
    const statusKey = status.toLowerCase().replace(/\s/g, '_');
    const tailwindClass = getStatusTailwindClass(statusKey, 'ptmRequest', 'badge');
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${tailwindClass}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">PTM Requests</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} /> Create PTM
          </button>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create PTM Request</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreatePTM} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Parent</option>
                    {parents.map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <input
                    type="datetime-local"
                    value={formData.preferred_time}
                    onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Create Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 border-b border-gray-200 flex overflow-x-auto">
          {statusTabs.map(tab => {
            const count = activeTab === tab.status ? filteredRequests.length : 0;
            return (
              <button
                key={tab.status}
                onClick={() => setActiveTab(tab.status as any)}
                className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.status
                    ? `text-${tab.color}-600 border-${tab.color}-600`
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            placeholder="Search by parent, teacher, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">Loading requests...</div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map(request => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 ${getStatusColor(request.status)}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        Parent: {request.parent_name}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                          <span className="font-medium">Teacher:</span> {request.teacher_name}
                        </div>
                        <div>
                          <span className="font-medium">Preferred Time:</span>{' '}
                          {request.preferred_time ? new Date(request.preferred_time).toLocaleString() : 'Not set'}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionMode('approve');
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center justify-center gap-1"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionMode('reject');
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center justify-center gap-1"
                      >
                        <AlertCircle size={16} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No requests in this status
              </div>
            )}
          </div>
        )}

        {/* Action Modal */}
        {actionMode && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {actionMode === 'approve' ? 'Approve Request' : 'Decline Request'}
              </h2>

              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={actionMode === 'approve' ? 'Additional notes (optional)' : 'Reason for rejection'}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    actionMode === 'approve'
                      ? handleApproveRequest(selectedRequest)
                      : handleRejectRequest(selectedRequest)
                  }
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium ${
                    actionMode === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionMode === 'approve' ? 'Approve' : 'Decline'}
                </button>
                <button
                  onClick={() => {
                    setActionMode(null);
                    setActionNotes('');
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
