/**
 * Merged Classes Utility
 * =======================
 * Logic for merging and managing merged classes in timetables
 * Allows one teacher to teach multiple sections in the same period
 */

import type { ClassInfo, ScheduleSlot, TimetableDB } from "../components/types";

/**
 * Detects classes that can be merged based on:
 * - Same teacher
 * - Same subject
 * - Same period and day
 * Returns grouped classes for merging
 */
export interface ClassGroupForMerge {
  teacher: string;
  subject: string;
  sections: string[];
  period: string;
  day: string;
  count: number;
}

/**
 * Find mergeable classes in a schedule
 * Groups classes by (teacher, subject, period, day)
 */
export function findMergeableClasses(
  schedule: ScheduleSlot[],
  branches: string[]
): ClassGroupForMerge[] {
  const groupMap = new Map<string, ClassGroupForMerge>();

  schedule.forEach((slot, timeIndex) => {
    branches.forEach((branch) => {
      const classInfo = slot.slots[branch];
      if (!classInfo || classInfo.isMerged) return;

      const key = `${classInfo.teacher}|${classInfo.subject}|${slot.time}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          teacher: classInfo.teacher,
          subject: classInfo.subject,
          sections: [],
          period: slot.time,
          day: "", // Day can be added if needed
          count: 0,
        });
      }

      const group = groupMap.get(key)!;
      group.sections.push(branch);
      group.count++;
    });
  });

  return Array.from(groupMap.values()).filter((g) => g.count > 1);
}

/**
 * Merge classes for a specific teacher in a specific period
 * Takes the first section as the master and merges others into it
 */
export function mergeClassesForTeacher(
  schedule: ScheduleSlot[],
  branches: string[],
  teacher: string,
  subject: string,
  period: string,
  masterSection: string
): ScheduleSlot[] {
  return schedule.map((slot) => {
    if (slot.time !== period) return slot;

    const newSlots = { ...slot.slots };
    let mergedSections: string[] = [];
    let masterClassInfo: ClassInfo | null = null;

    // Collect all sections for this teacher-subject-period combination
    branches.forEach((branch) => {
      const classInfo = newSlots[branch];
      if (
        classInfo &&
        classInfo.teacher === teacher &&
        classInfo.subject === subject
      ) {
        mergedSections.push(branch);
        if (branch === masterSection) {
          masterClassInfo = classInfo;
        }
      }
    });

    // Mark only the master section with merged info
    if (masterClassInfo && mergedSections.length > 1) {
      newSlots[masterSection] = {
        ...masterClassInfo,
        isMerged: true,
        mergedSections: mergedSections,
        masterSection: masterSection,
      };

      // Remove other sections' entries
      mergedSections.forEach((section) => {
        if (section !== masterSection) {
          newSlots[section] = null;
        }
      });
    }

    return { ...slot, slots: newSlots };
  });
}

/**
 * Unmerge a specific merged class back to individual sections
 */
export function unmergeClass(
  schedule: ScheduleSlot[],
  timeIndex: number,
  masterSection: string,
  originalClasses: Map<string, ClassInfo>
): ScheduleSlot[] {
  const newSchedule = [...schedule];
  const slot = newSchedule[timeIndex];

  if (!slot || !slot.slots[masterSection]) return schedule;

  const mergedClass = slot.slots[masterSection];
  if (!mergedClass?.mergedSections) return schedule;

  const newSlots = { ...slot.slots };

  // Restore individual sections
  mergedClass.mergedSections.forEach((section) => {
    const originalClass = originalClasses.get(section);
    if (originalClass) {
      newSlots[section] = {
        ...originalClass,
        isMerged: false,
        mergedSections: undefined,
        masterSection: undefined,
      };
    }
  });

  // Remove merged class from master section
  newSlots[masterSection] = null;

  newSchedule[timeIndex] = { ...slot, slots: newSlots };
  return newSchedule;
}

/**
 * Get all teachers teaching in same period across different sections
 * Useful for UI to suggest potential merges
 */
export function getTeachersWithMultipleClasses(
  schedule: ScheduleSlot[],
  branches: string[]
) {
  const teacherMap = new Map<string, Set<string>>();

  schedule.forEach((slot) => {
    branches.forEach((branch) => {
      const classInfo = slot.slots[branch];
      if (!classInfo || classInfo.isMerged) return;

      if (!teacherMap.has(classInfo.teacher)) {
        teacherMap.set(classInfo.teacher, new Set());
      }
      teacherMap.get(classInfo.teacher)!.add(branch);
    });
  });

  return Array.from(teacherMap.entries())
    .filter(([_, sections]) => sections.size > 1)
    .map(([teacher, sections]) => ({
      teacher,
      sections: Array.from(sections),
    }));
}

/**
 * Validate if merge is possible (same subject, same period, different sections)
 */
export function isValidMerge(
  schedule: ScheduleSlot[],
  sections: string[],
  period: string
): boolean {
  const slotIndex = schedule.findIndex((s) => s.time === period);
  if (slotIndex === -1) return false;

  const slot = schedule[slotIndex];
  const subjectSet = new Set<string>();
  const teacherSet = new Set<string>();

  sections.forEach((section) => {
    const classInfo = slot.slots[section];
    if (!classInfo) return false;

    subjectSet.add(classInfo.subject);
    teacherSet.add(classInfo.teacher);
  });

  // All must have same subject and teacher
  return subjectSet.size === 1 && teacherSet.size === 1;
}
