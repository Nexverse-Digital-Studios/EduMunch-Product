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
    <div className="p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Assignment Management</h1>

      {/* Tabs */}
      <div className="flex gap-8 mb-6 border-b">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 font-semibold ${
            activeTab === 'templates'
              ? 'text-blue-600 border-b-2'
              : 'text-gray-600'
          }`}
          style={activeTab === 'templates' ? { borderBottomColor: uiConfig.colors.primary['500'] } : {}}
        >
          Assignment Templates
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`pb-3 font-semibold ${
            activeTab === 'assigned'
              ? 'text-blue-600 border-b-2'
              : 'text-gray-600'
          }`}
          style={activeTab === 'assigned' ? { borderBottomColor: uiConfig.colors.primary['500'] } : {}}
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <select className="px-4 py-3 border border-gray-300 rounded-lg">
              <option>All Types</option>
              <option>Theory</option>
              <option>MCQ</option>
              <option>Practical</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg">
              <option>Sort: Newest</option>
              <option>Sort: Oldest</option>
            </select>
            <button
              className="px-6 py-2 rounded-lg text-white font-semibold"
              style={{ backgroundColor: uiConfig.colors.primary['500'] }}
            >
              ➕ Create Template
            </button>
          </div>

          {/* Templates Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{template.title}</div>
                        <div className="text-sm text-gray-600">{template.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                        style={{
                          backgroundColor:
                            template.type === 'Theory'
                              ? getStatusColorHex('theory', 'assignmentType')
                              : template.type === 'MCQ'
                                ? getStatusColorHex('mcq', 'assignmentType')
                                : getStatusColorHex('practical', 'assignmentType'),
                        }}
                      >
                        {template.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => setShowEditModal(true)} className="text-blue-600 hover:text-blue-800">
                        ✏️ Edit
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4">
              <option>JEE Advance Batch 2026 (Palava Brar</option>
            </select>
            <input
              type="text"
              placeholder="Search title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Sort */}
          <div className="mb-6 text-right">
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Sort: Newest</option>
              <option>Sort: Oldest</option>
            </select>
          </div>

          {/* Assigned Work Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Submissions</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assignedWorks.map((work) => (
                  <tr key={work.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{work.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{work.dueDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{work.submissions}</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Assignment Template</h2>
              <button onClick={() => setShowEditModal(false)} className="text-2xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input type="text" defaultValue="Theory Exam" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea defaultValue="Aliqua are golden questionaria 1. Explain the anatomy of the frog. 2. Explain DNA Formation." className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                <button className="flex items-center gap-2 text-blue-600 font-semibold mb-4">
                  📎 Upload File
                </button>
                <p className="text-sm text-gray-500">Supported: Images, PDF, Docs (Max 15MB)</p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-50">
                    <span className="text-4xl">📄</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Theory</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => setShowEditModal(false)} className="px-6 py-2 rounded-lg border border-gray-300">
                  Cancel
                </button>
                <button className="px-6 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: uiConfig.colors.primary['500'] }}>
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
