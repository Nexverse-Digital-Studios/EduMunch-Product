import { useState } from 'react';
import { uiConfig } from '@/config/ui.config';
import { getStatusColorHex } from '@/config/theme-colors';

interface Class {
  id: string;
  code: string;
  name: string;
  teacher: string;
  time: string;
  classroom: string;
  subject: string;
}

interface AttendanceRecord {
  date: string;
  subject: string;
  batch: string;
  teacher: string;
  time: string;
  status: 'NOT_MARKED' | 'LATE' | 'PRESENT';
}

export default function AttendanceManagementPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'reports' | 'student'>('schedule');
  const [selectedDate, setSelectedDate] = useState('12-12-2025');
  const [_selectedBatch] = useState('JEE Advance Batch 2026 (Palava Brar');
  const [_selectedStudent] = useState('Student 2 (JEE Foundation)');
  const [_reportMonth] = useState('Dec');
  const [_reportYear] = useState('2025');

  const scheduleClasses: Class[] = [
    { id: '1', code: '27KJ1', name: 'Phy', teacher: 'MNP', time: '02:00 PM - 04:00 PM', classroom: 'No classroom', subject: 'Physics' },
    { id: '2', code: '27KJ1', name: 'Chemistry', teacher: 'APCH', time: '04:30 PM - 06:30 PM', classroom: 'No classroom', subject: 'Chemistry' },
    { id: '3', code: '27KJ2', name: 'Math', teacher: 'ASM', time: '04:30 PM - 06:30 PM', classroom: 'No classroom', subject: 'Math' },
    { id: '4', code: '27KJ2', name: 'Biology', teacher: 'ASB', time: '07:00 PM - 09:00 PM', classroom: 'No classroom', subject: 'Biology' },
  ];

  const attendanceRecords: AttendanceRecord[] = [
    { date: 'Mon, Dec 1', subject: 'Math', batch: '26TJMA1', teacher: 'ASM', time: '01:31 PM -03:30 PM', status: 'NOT_MARKED' },
    { date: 'Mon, Dec 8', subject: 'Math', batch: '26TJMA1', teacher: 'RCM', time: '01:30 PM -03:30 PM', status: 'NOT_MARKED' },
    { date: 'Wed, Dec 10', subject: 'Math', batch: '26TJMA1', teacher: 'RCM', time: '01:30 PM -03:30 PM', status: 'LATE' },
    { date: 'Mon, Dec 15', subject: 'Math', batch: '26TJMA1', teacher: 'RCM', time: '01:30 PM -03:30 PM', status: 'NOT_MARKED' },
    { date: 'Mon, Dec 15', subject: 'Phy', batch: '26TJMA1', teacher: 'ZAP', time: '03:45 PM -05:45 PM', status: 'NOT_MARKED' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PRESENT': return getStatusColorHex('PRESENT', 'attendance');
      case 'LATE': return getStatusColorHex('LATE', 'attendance');
      case 'NOT_MARKED': return getStatusColorHex('NOT_MARKED', 'attendance');
      default: return getStatusColorHex('notMarked', 'attendance');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-8">Weekly Attendance & Lecture Management</h1>

      {/* Tabs */}
      <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-dark-border-primary">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${activeTab === 'schedule' ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-dark-text-secondary border-transparent'}`}
        >
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${activeTab === 'reports' ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-dark-text-secondary border-transparent'}`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${activeTab === 'student' ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' : 'text-gray-600 dark:text-dark-text-secondary border-transparent'}`}
        >
          Student Report
        </button>
      </div>

      {activeTab === 'schedule' && (
        <div>
          {/* Selectors */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Select Branch</label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary" defaultValue="Kalyan Branch">
                <option>Kalyan Branch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Filter by Batch (Optional)</label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary" defaultValue="All Batches in Branch">
                <option>All Batches in Branch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Select a day in week</label>
              <input type="date" value={selectedDate.split('-').reverse().join('-')} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary" />
            </div>
          </div>

          {/* Classes */}
          <div className="grid grid-cols-1 gap-4">
            {scheduleClasses.map((cls) => (
              <div key={cls.id} className="bg-white dark:bg-dark-surface-primary rounded-lg p-6 border border-gray-200 dark:border-dark-border-primary hover:shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-dark-text-primary">{cls.code} - {cls.name}</div>
                    <div className="text-sm text-gray-600 dark:text-dark-text-secondary">By {cls.teacher}</div>
                    <div className="text-sm text-gray-600 dark:text-dark-text-secondary">{cls.time}</div>
                    <div className="text-sm text-gray-500 dark:text-dark-text-secondary">{cls.classroom}</div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold">
                      ✓ Attendance
                    </button>
                    <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-surface-secondary text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-surface-primary font-semibold">
                      📝 Remarks
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          {/* Reports Controls */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Syllabus Status</label>
              <div className="p-4 border border-gray-300 dark:border-dark-border-primary rounded-lg text-sm text-gray-600 dark:text-dark-text-secondary bg-white dark:bg-dark-surface-secondary">
                <div className="font-semibold mb-2">Choose a batch to view syllabus progress.</div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Teacher Activity Log</label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary">
                <option>RCM</option>
              </select>
            </div>
            <div className="col-span-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-dark-text-primary">Calculus</div>
                    <div className="text-xs text-gray-600 dark:text-dark-text-secondary">Math • 26TJMA1</div>
                  </div>
                  <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">IN_PROGRESS</div>
                </div>
                <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-dark-text-primary">Continuity</div>
                    <div className="text-xs text-gray-600 dark:text-dark-text-secondary">Math • 27KJ1</div>
                  </div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">COMPLETED</div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Records */}
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow overflow-hidden border border-gray-200 dark:border-dark-border-primary">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-surface-secondary border-b border-gray-200 dark:border-dark-border-primary">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Batch</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Teacher</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border-primary">
                {attendanceRecords.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-surface-secondary">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">{record.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">{record.batch}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">{record.teacher}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">{record.time}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'PRESENT' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        record.status === 'LATE' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-400'
                      }`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'student' && (
        <div>
          {/* Student Report Filters */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Select Student Admission</label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary" value={_selectedStudent}>
                <option>Student 2 (JEE Foundation)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Month</label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary" value={_reportMonth}>
                <option>Dec</option>
                <option>Jan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Year</label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary" value={_reportYear}>
                <option>2025</option>
                <option>2026</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-6 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold">
                📥 Get Report
              </button>
            </div>
          </div>

          {/* Attendance Records Table */}
          <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow overflow-hidden border border-gray-200 dark:border-dark-border-primary">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-surface-secondary border-b border-gray-200 dark:border-dark-border-primary">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Batch</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Teacher</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-dark-text-primary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border-primary">
                {attendanceRecords.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-surface-secondary">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">{record.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">{record.batch}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">{record.teacher}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">{record.time}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'PRESENT' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        record.status === 'LATE' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-400'
                      }`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}



