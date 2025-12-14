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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Weekly Attendance & Lecture Management</h1>

      {/* Tabs */}
      <div className="flex gap-8 mb-6 border-b">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 font-semibold ${activeTab === 'schedule' ? 'text-blue-600 border-b-2' : 'text-gray-600'}`}
          style={activeTab === 'schedule' ? { borderBottomColor: uiConfig.colors.primary['500'] } : {}}
        >
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 font-semibold ${activeTab === 'reports' ? 'text-blue-600 border-b-2' : 'text-gray-600'}`}
          style={activeTab === 'reports' ? { borderBottomColor: uiConfig.colors.primary['500'] } : {}}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`pb-3 font-semibold ${activeTab === 'student' ? 'text-blue-600 border-b-2' : 'text-gray-600'}`}
          style={activeTab === 'student' ? { borderBottomColor: uiConfig.colors.primary['500'] } : {}}
        >
          Student Report
        </button>
      </div>

      {activeTab === 'schedule' && (
        <div>
          {/* Selectors */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg" defaultValue="Kalyan Branch">
                <option>Kalyan Branch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Batch (Optional)</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg" defaultValue="All Batches in Branch">
                <option>All Batches in Branch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select a day in week</label>
              <input type="date" value={selectedDate.split('-').reverse().join('-')} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>
          </div>

          {/* Classes */}
          <div className="grid grid-cols-1 gap-4">
            {scheduleClasses.map((cls) => (
              <div key={cls.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900">{cls.code} - {cls.name}</div>
                    <div className="text-sm text-gray-600">By {cls.teacher}</div>
                    <div className="text-sm text-gray-600">{cls.time}</div>
                    <div className="text-sm text-gray-500">{cls.classroom}</div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: uiConfig.colors.primary['500'] }}>
                      ✓ Attendance
                    </button>
                    <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus Status</label>
              <div className="p-4 border border-gray-300 rounded-lg text-sm text-gray-600">
                <div className="font-semibold mb-2">Choose a batch to view syllabus progress.</div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Activity Log</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>RCM</option>
              </select>
            </div>
            <div className="col-span-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">Calculus</div>
                    <div className="text-xs text-gray-600">Math • 26TJMA1</div>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">IN_PROGRESS</div>
                </div>
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">Continuity</div>
                    <div className="text-xs text-gray-600">Math • 27KJ1</div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">COMPLETED</div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Records */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Batch</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendanceRecords.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.batch}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.teacher}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.time}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: getStatusColor(record.status) }}>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Student Admission</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg" value={_selectedStudent}>
                <option>Student 2 (JEE Foundation)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg" value={_reportMonth}>
                <option>Dec</option>
                <option>Jan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg" value={_reportYear}>
                <option>2025</option>
                <option>2026</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-6 py-3 rounded-lg text-white font-semibold" style={{ backgroundColor: uiConfig.colors.primary['500'] }}>
                📥 Get Report
              </button>
            </div>
          </div>

          {/* Attendance Records Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Batch</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendanceRecords.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.batch}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.teacher}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.time}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: getStatusColor(record.status) }}>
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
