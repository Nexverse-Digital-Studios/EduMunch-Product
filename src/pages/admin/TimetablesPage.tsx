import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { timetableService } from "@/services/timetableService";
import { Plus, Trash2 } from "lucide-react";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export default function TimetablesPage() {
  const { user } = useAuthStore();
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [timetable, setTimetable] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  useEffect(() => {
    // Mock batches
    setBatches([
      { id: "batch1", name: "Class 10-A" },
      { id: "batch2", name: "Class 10-B" },
      { id: "batch3", name: "Class 11-A" },
    ]);

    // Mock subjects
    setSubjects([
      { id: "sub1", name: "Mathematics" },
      { id: "sub2", name: "Physics" },
      { id: "sub3", name: "Chemistry" },
      { id: "sub4", name: "Biology" },
      { id: "sub5", name: "English" },
      { id: "sub6", name: "History" },
    ]);
  }, []);

  const handleBatchSelect = async (batchId: string) => {
    setSelectedBatch(batchId);
    setLoading(true);

    const { data } = await timetableService.getTimetablesByBatchComplete(
      user,
      batchId
    );

    if (data && data.length > 0) {
      setTimetable(data[0]);
      setSlots(data[0].slots || []);
    } else {
      // Create new timetable
      const { data: newTT } = await timetableService.createTimetable(user, {
        batch_id: batchId,
        week_date: new Date().toISOString().split("T")[0],
      });

      if (newTT) {
        setTimetable(newTT);
        setSlots([]);
      }
    }

    setLoading(false);
  };

  const handleAddSlot = async (day: string, startTime: string) => {
    if (!selectedBatch || !timetable) {
      alert("Please select a batch first");
      return;
    }

    setSelectedSlot({ day, startTime });
    setShowModal(true);
  };

  const handleSaveSlot = async (subject: string) => {
    if (!selectedSlot || !timetable) return;

    const endTime = `${parseInt(selectedSlot.startTime.split(":")[0]) + 1}:00`;

    const { error } = await timetableService.addSlot(user, {
      timetable_id: timetable.id,
      day_of_week: selectedSlot.day,
      start_time: selectedSlot.startTime,
      end_time: endTime,
      subject_id: subject,
      is_merged: false,
    });

    if (!error) {
      const { data } = await timetableService.getTimetableSlots(
        user,
        timetable.id
      );
      setSlots(data || []);
      setShowModal(false);
      setSelectedSlot(null);
    }
  };

  const getSlotForDayTime = (day: string, time: string) => {
    return slots.find(
      (s) => s.day_of_week === day && s.start_time.startsWith(time.split(":")[0])
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Weekly Timetables</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} /> Bulk Schedule
        </button>
      </div>

      {/* Batch Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Batch
        </label>
        <select
          value={selectedBatch}
          onChange={(e) => handleBatchSelect(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a batch --</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Timetable Grid */}
      {selectedBatch && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                      Time
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="px-6 py-3 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 min-w-[150px]"
                      >
                        {day.substring(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time) => (
                    <tr key={time} className="border-b border-gray-200">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
                        {time}
                      </td>
                      {DAYS.map((day) => {
                        const slot = getSlotForDayTime(day, time);
                        return (
                          <td
                            key={`${day}-${time}`}
                            className="px-6 py-4 border-r border-gray-200 text-center"
                          >
                            {slot ? (
                              <div className="bg-blue-100 border border-blue-300 rounded p-2 relative group">
                                <p className="text-xs font-semibold text-blue-900">
                                  {subjects.find((s) => s.id === slot.subject_id)
                                    ?.name || "Unassigned"}
                                </p>
                                <button
                                  onClick={() => {
                                    // Handle delete
                                  }}
                                  className="absolute top-1 right-1 hidden group-hover:block text-red-600 hover:text-red-900"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddSlot(day, time)}
                                className="w-full h-12 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
                              >
                                <Plus size={18} />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Slot Assignment Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">
              Assign Subject for {selectedSlot.day} at {selectedSlot.startTime}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select subject --</option>
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Select faculty member"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSlot(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleSaveSlot(
                    "sub1"
                  )
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
