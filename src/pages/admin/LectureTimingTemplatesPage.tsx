import { useState, useEffect } from 'react';
import { Plus, X, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { lectureTemplateService } from '@/services/lectureTemplateService';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

interface TimeSlot {
  id?: string;
  start_time: string;
  end_time: string;
  slot_order: number;
}

interface DaySlots {
  [day: string]: TimeSlot[];
}

export function LectureTimingTemplatesPage() {
  const { user } = useAuthStore();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [daySlots, setDaySlots] = useState<DaySlots>({
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  });
  const [activeTemplate, setActiveTemplate] = useState<any>(null);

  useEffect(() => {
    // Mock branches load - in real app, fetch from service
    setBranches([
      { id: '1', name: 'Main Campus' },
      { id: '2', name: 'Secondary Campus' },
    ]);
  }, []);

  useEffect(() => {
    if (selectedBranch && user) {
      loadTemplate();
    }
  }, [selectedBranch, user]);

  const loadTemplate = async () => {
    if (!user || !selectedBranch) return;
    try {
      const templates = await lectureTemplateService.getTemplatesByBranch(user, selectedBranch);
      if (templates.length > 0) {
        setActiveTemplate(templates[0]);
        const slots = await lectureTemplateService.getSlotsByTemplate(user, templates[0].id);
        
        const slotsByDay: DaySlots = {
          MONDAY: [],
          TUESDAY: [],
          WEDNESDAY: [],
          THURSDAY: [],
          FRIDAY: [],
          SATURDAY: [],
          SUNDAY: [],
        };

        slots.forEach(slot => {
          if (slotsByDay[slot.day_of_week]) {
            slotsByDay[slot.day_of_week].push({
              id: slot.id,
              start_time: slot.start_time,
              end_time: slot.end_time,
              slot_order: slot.slot_order,
            });
          }
        });

        setDaySlots(slotsByDay);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const handleAddSlot = async (day: string) => {
    if (!user || !activeTemplate) return;
    try {
      const newSlot: TimeSlot = {
        start_time: '08:30',
        end_time: '10:30',
        slot_order: daySlots[day].length + 1,
      };

      const created = await lectureTemplateService.addSlot(
        user,
        activeTemplate.id,
        day,
        newSlot.start_time,
        newSlot.end_time,
        newSlot.slot_order
      );

      setDaySlots({
        ...daySlots,
        [day]: [...daySlots[day], {
          id: created.id,
          start_time: created.start_time,
          end_time: created.end_time,
          slot_order: created.slot_order,
        }],
      });
    } catch (error) {
      console.error('Error adding slot:', error);
    }
  };

  const handleDeleteSlot = async (day: string, slotId: string | undefined) => {
    if (!user || !slotId) return;
    try {
      await lectureTemplateService.removeSlot(user, slotId);
      setDaySlots({
        ...daySlots,
        [day]: daySlots[day].filter(s => s.id !== slotId),
      });
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const handleUpdateSlot = async (day: string, slotIndex: number, field: string, value: string) => {
    const updatedSlots = [...daySlots[day]];
    updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], [field]: value };
    
    setDaySlots({
      ...daySlots,
      [day]: updatedSlots,
    });

    if (user && updatedSlots[slotIndex].id) {
      try {
        await lectureTemplateService.updateSlot(user, updatedSlots[slotIndex].id!, {
          [field]: value,
        });
      } catch (error) {
        console.error('Error updating slot:', error);
      }
    }
  };

  const handleCreateTemplate = async () => {
    if (!user || !selectedBranch) return;
    try {
      const template = await lectureTemplateService.createTemplate(user, selectedBranch, 'Default Schedule');
      setActiveTemplate(template);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Lecture Timing Templates</h1>

        {/* Branch Selector */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Select Branch</label>
          <div className="flex gap-4">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
            >
              <option value="">Choose a branch...</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            {selectedBranch && !activeTemplate && (
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                Create Template
              </button>
            )}
          </div>
        </div>

        {/* Day-wise Slots */}
        {selectedBranch && activeTemplate && (
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6 border border-gray-200 dark:border-dark-border-primary">
                <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">{day}</h2>

                {daySlots[day].length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {daySlots[day].map((slot, index) => (
                      <div key={slot.id || index} className="flex gap-4 items-center bg-gray-50 dark:bg-dark-surface-secondary p-3 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => handleUpdateSlot(day, index, 'start_time', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-primary text-gray-900 dark:text-dark-text-primary"
                          />
                          <span className="text-gray-500 dark:text-gray-400">to</span>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => handleUpdateSlot(day, index, 'end_time', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-primary text-gray-900 dark:text-dark-text-primary"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteSlot(day, slot.id)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No slots configured</p>
                )}

                <button
                  onClick={() => handleAddSlot(day)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-sm font-medium"
                >
                  <Plus size={16} /> Add Slot
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedBranch && !activeTemplate && (
          <div className="text-center py-12">
            <Clock className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Create a template to add lecture slots</p>
          </div>
        )}
      </div>
    </div>
  );
}

