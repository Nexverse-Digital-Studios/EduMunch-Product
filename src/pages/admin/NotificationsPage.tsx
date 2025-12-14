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
    <div className="bg-gray-50 dark:bg-dark-surface-secondary p-4 rounded-lg border border-gray-200 dark:border-dark-border-primary">
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">{label}</h4>
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
                className="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-dark-border-primary rounded bg-white dark:bg-dark-surface-primary"
              />
              <span className="text-sm text-gray-700 dark:text-slate-400">{item}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Send Notifications</h1>

        {/* Tabs */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow mb-6 border-b border-gray-200 dark:border-dark-border-primary">
          <div className="flex">
            <button
              onClick={() => setActiveTab('compose')}
              className={`flex-1 px-6 py-3 font-medium text-center border-b-2 transition ${
                activeTab === 'compose'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-600 dark:text-dark-text-secondary border-transparent hover:text-gray-900 dark:hover:text-dark-text-primary'
              }`}
            >
              <Send className="inline mr-2" size={18} /> Send New
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-3 font-medium text-center border-b-2 transition ${
                activeTab === 'history'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-600 dark:text-dark-text-secondary border-transparent hover:text-gray-900 dark:hover:text-dark-text-primary'
              }`}
            >
              <History className="inline mr-2" size={18} /> History
            </button>
          </div>
        </div>

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6">
            {message && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-600 text-green-800 dark:text-green-400 rounded-lg">
                {message}
              </div>
            )}

            <form onSubmit={handleSendNotification}>
              {/* Title & Message */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Notification title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Notification message"
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Target Audience</h3>
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
                className="w-full px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center justify-center gap-2"
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
              <div className="text-center py-12 text-gray-900 dark:text-white">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6 border border-gray-200 dark:border-dark-border-primary">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{notification.title}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-slate-400 mb-2">{notification.message}</p>
                  {notification.link && (
                    <a href={notification.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
                      {notification.link}
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No notifications sent yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
