import { useState } from 'react';
import { uiConfig } from '@/config/ui.config';
import { getStatusColorHex } from '@/config/theme-colors';

interface AssignmentTemplate {
  id: string;
  title: string;
  type: 'Theory' | 'MCQ' | 'Practical';
  description: string;
  subject?: string;
  assignmentType?: string;
}

interface AssignedWork {
  id: string;
  title: string;
  batchId: string;
  dueDate: string;
  submissions: number;
}

export default function AssignmentManagementPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'assigned'>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const templates: AssignmentTemplate[] = [
    {
      id: '1',
      title: 'Theory Exam',
      type: 'Theory',
      description: 'Answer the below questions- 1 Ex...',
      subject: 'Physics',
      assignmentType: 'Theory',
    },
    {
      id: '2',
      title: 'Mcq questions Maths',
      type: 'MCQ',
      description: 'Solve all the below (3 questions)',
      subject: 'Maths',
      assignmentType: 'MCQ',
    },
  ];

  const assignedWorks: AssignedWork[] = [
    { id: '1', title: 'Mcq questions Maths', batchId: 'JEE Advance Batch 2026 (Palava Brar', dueDate: '12/6/2025', submissions: 1 },
    { id: '2', title: 'Theory Exam', batchId: 'JEE Advance Batch 2026 (Palava Brar', dueDate: '12/7/2025', submissions: 1 },
    { id: '3', title: 'Theory Exam', batchId: 'JEE Advance Batch 2026 (Palava Brar', dueDate: '12/6/2025', submissions: 1 },
  ];

  return (
    <div className="p-8 bg-white dark:bg-dark-bg-primary">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Assignment Management</h1>

      {/* Tabs */}
      <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-dark-border-primary">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-600 dark:text-slate-400 border-transparent'
          }`}
        >
          Assignment Templates
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'assigned'
              ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-600 dark:text-slate-400 border-transparent'
          }`}
        >
          Assigned Work & Grading
        </button>
      </div>

      {activeTab === 'templates' && (
        <div>
          {/* Search and Sort */}
          <div className="flex justify-between items-center mb-6 gap-4">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <select className="px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white">
              <option>All Types</option>
              <option>Theory</option>
              <option>MCQ</option>
              <option>Practical</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white">
              <option>Sort: Newest</option>
              <option>Sort: Oldest</option>
            </select>
            <button
              className="px-6 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold"
            >
              ➕ Create Template
            </button>
          </div>

          {/* Templates Table */}
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow overflow-hidden border border-gray-200 dark:border-dark-border-primary">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-surface-secondary border-b border-gray-200 dark:border-dark-border-primary">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border-primary">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface-secondary">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{template.title}</div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">{template.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          template.type === 'Theory'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                            : template.type === 'MCQ'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                        }`}
                      >
                        {template.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => setShowEditModal(true)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        ✏️ Edit
                      </button>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        🔗 Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'assigned' && (
        <div>
          {/* Batch Selector and Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Batch</label>
            <select className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg mb-4 bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white">
              <option>JEE Advance Batch 2026 (Palava Brar</option>
            </select>
            <input
              type="text"
              placeholder="Search title..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Sort */}
          <div className="mb-6 text-right">
            <select className="px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white">
              <option>Sort: Newest</option>
              <option>Sort: Oldest</option>
            </select>
          </div>

          {/* Assigned Work Table */}
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow overflow-hidden border border-gray-200 dark:border-dark-border-primary">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-surface-secondary border-b border-gray-200 dark:border-dark-border-primary">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white">Submissions</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border-primary">
                {assignedWorks.map((work) => (
                  <tr key={work.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface-secondary">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{work.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{work.dueDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{work.submissions}</td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-semibold">
                        👁️ View Submissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg max-w-2xl w-full p-8 border border-gray-200 dark:border-dark-border-primary">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Assignment Template</h2>
              <button onClick={() => setShowEditModal(false)} className="text-2xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Title</label>
                <input type="text" defaultValue="Theory Exam" className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Subject</label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white">
                  <option>Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Description</label>
                <textarea defaultValue="Aliqua are golden questionaria 1. Explain the anatomy of the frog. 2. Explain DNA Formation." className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg h-24 bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Attachments</label>
                <button className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold mb-4">
                  📎 Upload File
                </button>
                <p className="text-sm text-gray-500 dark:text-slate-400">Supported: Images, PDF, Docs (Max 15MB)</p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="w-24 h-24 border border-gray-200 dark:border-dark-border-primary rounded-lg flex items-center justify-center bg-gray-50 dark:bg-dark-surface-secondary">
                    <span className="text-4xl">📄</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Assignment Type</label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white">
                  <option>Theory</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => setShowEditModal(false)} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-dark-surface-primary">
                  Cancel
                </button>
                <button className="px-6 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold">
                  ✓ Update Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
