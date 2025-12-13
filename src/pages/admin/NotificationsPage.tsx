import React, { useState, useEffect } from 'react';
import { Send, History } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { notificationService, Notification } from '@/services/notificationService';

export function NotificationsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    link: '',
    targetRoles: [] as string[],
    targetBranches: [] as string[],
    targetCourses: [] as string[],
    targetBatches: [] as string[],
    targetTieUpSchools: [] as string[],
  });

  const availableRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];
  const availableBranches = ['Main Campus', 'Secondary Campus'];
  const availableCourses = ['Course A', 'Course B', 'Course C'];
  const availableBatches = ['Batch 2024', 'Batch 2025'];
  const availableTieUpSchools = ['School A', 'School B', 'School C'];

  useEffect(() => {
    if (activeTab === 'history' && user) {
      loadNotifications();
    }
  }, [activeTab, user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const targets: any[] = [];

      // Add role targets
      formData.targetRoles.forEach(role => {
        targets.push({ type: 'ROLE', value: role, name: role });
      });

      // Add branch targets
      formData.targetBranches.forEach(branch => {
        targets.push({ type: 'BRANCH', value: branch, name: branch });
      });

      // Add course targets
      formData.targetCourses.forEach(course => {
        targets.push({ type: 'COURSE', value: course, name: course });
      });

      // Add batch targets
      formData.targetBatches.forEach(batch => {
        targets.push({ type: 'BATCH', value: batch, name: batch });
      });

      // Add tie-up school targets
      formData.targetTieUpSchools.forEach(school => {
        targets.push({ type: 'TIE_UP_SCHOOL', value: school, name: school });
      });

      await notificationService.composeAndSendNotification(
        user,
        formData.title,
        formData.message,
        targets,
        formData.link || undefined
      );

      setMessage('Notification sent successfully!');
      setFormData({
        title: '',
        message: '',
        link: '',
        targetRoles: [],
        targetBranches: [],
        targetCourses: [],
        targetBatches: [],
        targetTieUpSchools: [],
      });

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('Error sending notification');
    }
  };

  const toggleTarget = (category: string, value: string) => {
    const key = `target${category}` as keyof typeof formData;
    const current = formData[key] as string[];
    
    if (current.includes(value)) {
      setFormData({
        ...formData,
        [key]: current.filter(item => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        [key]: [...current, value],
      });
    }
  };

  const MultiSelectCheckbox = ({ category, label, items }: any) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-3">{label}</h4>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item: string) => {
          const key = `target${category}` as keyof typeof formData;
          const isSelected = (formData[key] as string[]).includes(item);
          return (
            <label key={item} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleTarget(category, item)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Send Notifications</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('compose')}
              className={`flex-1 px-6 py-3 font-medium text-center border-b-2 transition ${
                activeTab === 'compose'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <Send className="inline mr-2" size={18} /> Send New
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-3 font-medium text-center border-b-2 transition ${
                activeTab === 'history'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <History className="inline mr-2" size={18} /> History
            </button>
          </div>
        </div>

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="bg-white rounded-lg shadow p-6">
            {message && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                {message}
              </div>
            )}

            <form onSubmit={handleSendNotification}>
              {/* Title & Message */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Notification title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Notification message"
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Target Audience</h3>
                <div className="space-y-4">
                  <MultiSelectCheckbox category="Roles" label="Roles" items={availableRoles} />
                  <MultiSelectCheckbox category="Branches" label="Branches" items={availableBranches} />
                  <MultiSelectCheckbox category="Courses" label="Courses" items={availableCourses} />
                  <MultiSelectCheckbox category="Batches" label="Batches" items={availableBatches} />
                  <MultiSelectCheckbox category="TieUpSchools" label="Tie-up Schools" items={availableTieUpSchools} />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Send size={20} /> Send Notification
              </button>
            </form>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{notification.message}</p>
                  {notification.link && (
                    <a href={notification.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {notification.link}
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No notifications sent yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
