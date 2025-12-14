import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { workingHourService } from "@/services/workingHourService";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default function WorkingHoursPage() {
  const { user } = useAuthStore();
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState<{
    [key: string]: { start_time: string; end_time: string; is_week_off: boolean };
  }>({});

  useEffect(() => {
    if (user?.orgId) {
      fetchWorkingHours();
      fetchEmployees();
    }
  }, [user?.orgId]);

  useEffect(() => {
    if (selectedEmployee && workingHours.length > 0) {
      const empHours = workingHours.filter(
        (h) => h.employee_id === selectedEmployee
      );

      const form: any = {};
      DAYS.forEach((day) => {
        const existing = empHours.find((h) => h.day_of_week === day);
        form[day] = existing || {
          start_time: "09:00",
          end_time: "17:00",
          is_week_off: false,
        };
      });
      setFormData(form);
    }
  }, [selectedEmployee]);

  const fetchWorkingHours = async () => {
    const { data } = await workingHourService.getAllWorkingHours(user);
    setWorkingHours(data || []);
  };

  const fetchEmployees = async () => {
    // This would ideally come from employees service
    // For now, we'll use a mock list
    setEmployees([
      { id: "1", name: "John Doe" },
      { id: "2", name: "Jane Smith" },
      { id: "3", name: "Robert Johnson" },
    ]);
  };

  const handleSave = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    const hoursArray = DAYS.map((day) => ({
      employee_id: selectedEmployee,
      day_of_week: day,
      ...formData[day],
    }));

    const { error } = await workingHourService.bulkSetWorkingHours(
      user,
      selectedEmployee,
      hoursArray
    );

    if (!error) {
      alert("Working hours saved successfully");
      fetchWorkingHours();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">Working Hours</h1>
        <p className="text-gray-600 dark:text-dark-text-secondary mt-1">
          Configure employee working hours for each day of the week
        </p>
      </div>

      {/* Employee Selector */}
      <div className="bg-white dark:bg-dark-surface-primary rounded-lg shadow p-6 border border-gray-200 dark:border-dark-border-primary">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">
          Select Employee
        </label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-indigo-500 mb-6"
        >
          <option value="">-- Select an employee --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        {selectedEmployee && (
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-surface-secondary rounded-lg border border-gray-200 dark:border-dark-border-primary">
                <div className="w-24 font-medium text-gray-700 dark:text-dark-text-primary">{day}</div>

                <div className="flex-1 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData[day]?.is_week_off || false}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          [day]: {
                            ...formData[day],
                            is_week_off: e.target.checked,
                          },
                        });
                      }}
                      className="rounded border-gray-300 dark:border-dark-border-primary text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Week Off</span>
                  </label>

                  {!formData[day]?.is_week_off && (
                    <>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-dark-text-secondary">From:</label>
                        <input
                          type="time"
                          value={formData[day]?.start_time || "09:00"}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              [day]: {
                                ...formData[day],
                                start_time: e.target.value,
                              },
                            });
                          }}
                          className="px-3 py-1 border border-gray-300 dark:border-dark-border-primary rounded bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-dark-text-secondary">To:</label>
                        <input
                          type="time"
                          value={formData[day]?.end_time || "17:00"}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              [day]: {
                                ...formData[day],
                                end_time: e.target.value,
                              },
                            });
                          }}
                          className="px-3 py-1 border border-gray-300 dark:border-dark-border-primary rounded bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => setSelectedEmployee("")}
                className="px-6 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-surface-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {selectedEmployee && formData && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <p className="text-sm text-indigo-900 dark:text-indigo-300">
            <strong>Note:</strong> Working hours have been configured. Make sure
            to review and save changes before closing.
          </p>
        </div>
      )}
    </div>
  );
}
