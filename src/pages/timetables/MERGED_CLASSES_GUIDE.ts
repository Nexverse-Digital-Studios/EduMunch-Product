// MERGED CLASSES FEATURE DOCUMENTATION
// =====================================

/*
 * FEATURE: Merged Classes for Timetable Management
 * 
 * Overview:
 * ---------
 * This feature allows one teacher to teach multiple sections in the same period.
 * Instead of creating separate timetable entries for each section, merged classes
 * consolidate multiple sections into a single timetable slot.
 * 
 * USE CASES:
 * ----------
 * 1. Single teacher, multiple sections, same subject, same period
 *    Example: Teacher John teaches Mathematics to Section A and Section B 
 *             during Period 2, merging them into one class
 * 
 * 2. Custom periods (flexible timing)
 *    Teacher can merge classes across custom time slots
 * 
 * 3. Combined classes (e.g., lab classes, assemblies)
 *    Multiple grades coming together for a special session
 * 
 * ARCHITECTURE:
 * =============
 * 
 * 1. TYPE DEFINITIONS (types.ts)
 *    - ClassInfo: Updated with merge-related fields
 *      * isMerged: boolean - Indicates if class is merged
 *      * mergedSections: string[] - List of sections in this merged class
 *      * masterSection: string - Primary section ID (where merged class is shown)
 *    
 *    - MergedClass: Represents a merged teaching session
 *      * teacher: string
 *      * subject: string
 *      * sections: string[] - All sections in the merge
 *      * period: string
 *      * day: string
 * 
 * 2. UTILITY FUNCTIONS (utils/mergeClasses.ts)
 * 
 *    a) findMergeableClasses()
 *       Purpose: Identifies groups of classes that can be merged
 *       Returns: ClassGroupForMerge[] with (teacher, subject, period, sections)
 *       Use: To suggest mergeable combinations to the user
 * 
 *    b) mergeClassesForTeacher()
 *       Purpose: Merges multiple section entries into one
 *       Logic:
 *         - Keeps the master section entry with isMerged = true
 *         - Sets mergedSections array with all section names
 *         - Removes other section entries from the schedule
 *         - Marks cell with visual indicator (border, badge)
 * 
 *    c) unmergeClass()
 *       Purpose: Splits a merged class back into individual sections
 *       Logic:
 *         - Restores individual entries for each section
 *         - Removes merged class from master section
 *         - Clears merge-related metadata
 * 
 *    d) getTeachersWithMultipleClasses()
 *       Purpose: Finds teachers with same class in multiple sections
 *       Returns: Array of {teacher, sections}
 *       Use: For automatic merge suggestions
 * 
 *    e) isValidMerge()
 *       Purpose: Validates merge criteria
 *       Checks:
 *         - Same teacher
 *         - Same subject
 *         - Same period
 *         - Different sections
 * 
 * 3. UI COMPONENTS
 * 
 *    a) MergeClassesDialog (MergeClassesDialog.tsx)
 *       - Multi-select dialog for choosing sections to merge
 *       - Groups classes by teacher-subject combination
 *       - Master section selector (primary section for the merge)
 *       - Merge/cancel buttons with validation
 * 
 *    b) TimetableGrid Updates
 *       - Merge button (Link2 icon) on each class cell
 *       - Unmerge button (Unlink2 icon) for merged classes
 *       - Visual styling for merged cells:
 *         * bg-primary/10 background
 *         * border-l-4 border-l-primary left border
 *       - Badge showing "MERGED (n)" with section list
 * 
 * 4. INTEGRATION (TimetablesList.tsx)
 * 
 *    State Management:
 *    - isMergeOpen: Dialog visibility
 *    - mergeContext: {timeIndex, period} for merge operation
 * 
 *    Handlers:
 *    - handleMergeClick(timeIndex, period)
 *      Opens merge dialog for selecting sections
 * 
 *    - handleMerge(masterSection, sectionsToMerge)
 *      Executes merge and updates schedule
 * 
 *    - handleUnmerge(timeIndex, masterSection)
 *      Splits merged class back to individuals
 * 
 * DATA FLOW:
 * ===========
 * 
 * 1. MERGING PROCESS:
 *    User clicks "Merge" button on class cell
 *      ↓
 *    handleMergeClick() sets merge context & opens dialog
 *      ↓
 *    MergeClassesDialog shows available combinations
 *      ↓
 *    User selects sections and master section
 *      ↓
 *    handleMerge() calls mergeClassesForTeacher()
 *      ↓
 *    Schedule updated with merged class
 *      ↓
 *    TimetableGrid re-renders with merged badge
 * 
 * 2. UNMERGING PROCESS:
 *    User clicks "Unmerge" button on merged class
 *      ↓
 *    handleUnmerge() calls unmergeClass()
 *      ↓
 *    Schedule restored with individual section entries
 *      ↓
 *    TimetableGrid re-renders without merge indicator
 * 
 * VISUAL CHANGES:
 * ================
 * 
 * REGULAR CLASS:
 * ┌─────────────────┐
 * │ Mathematics     │
 * │ Mr. John        │
 * │ [Merge] [Edit]  │
 * └─────────────────┘
 * 
 * MERGED CLASS:
 * ┌─────────────────────────────────┐  ← Primary border
 * │ Mathematics                     │
 * │ Mr. John                        │
 * │ [MERGED (2)]  ← Badge           │
 * │ Sections: A, B                  │
 * │ [Unmerge] [Edit] [Delete]       │
 * └─────────────────────────────────┘
 * Background: Light blue (primary/10)
 * Left border: 4px primary color
 * 
 * DATABASE SCHEMA NOTES:
 * ======================
 * Current schema (timetables table):
 * - section_id
 * - teacher_id
 * - subject_id
 * - period_id
 * - day_of_week
 * 
 * For database persistence:
 * Option 1: Store merged info in timetable record
 *   - Add 'merged_section_ids' JSON array
 *   - Add 'is_merged' boolean
 *   - Add 'master_section_id' reference
 * 
 * Option 2: Create separate merge mapping table
 *   - merged_classes table
 *   - Links primary timetable entry to section IDs
 * 
 * IMPLEMENTATION EXAMPLE:
 * ======================
 * 
 * Scenario: Teacher teaches Math to Section A and B during Period 2
 * 
 * Before merge:
 * Period 2:
 *   Section A: Mathematics - Mr. John [Merge]
 *   Section B: Mathematics - Mr. John [Merge]
 * 
 * After merge (selecting A as master):
 * Period 2:
 *   Section A: Mathematics - Mr. John [MERGED (2)] Sections: A, B [Unmerge]
 *   Section B: (empty)
 * 
 * CONFLICT DETECTION:
 * ===================
 * The system prevents invalid merges:
 * - Different teachers → Cannot merge
 * - Different subjects → Cannot merge
 * - Different periods → Cannot merge
 * - Already merged → Can unmerge instead
 * 
 * FUTURE ENHANCEMENTS:
 * ====================
 * 1. Database persistence (save merged state)
 * 2. Conflict checking (teacher availability in merged slots)
 * 3. Bulk merge operations (merge all classes for a teacher)
 * 4. Custom merge time slots (if needed)
 * 5. Room assignment for merged classes
 * 6. Attendance tracking for merged sessions
 * 7. Grade/report generation for merged classes
 */

// CODE USAGE EXAMPLES:
// ====================

// Example 1: Merge Mathematics classes
/*
handleMergeClick(2, "10:00 AM - 10:45 AM");
// Opens dialog showing:
// - Section A: Mathematics - Mr. John
// - Section B: Mathematics - Mr. John
// User selects both, chooses A as master
// → handleMerge("A", ["A", "B"]) is called
*/

// Example 2: Unmerge a class
/*
handleUnmerge(2, "A");
// Splits merged class back into:
// - Section A: Mathematics - Mr. John
// - Section B: Mathematics - Mr. John
*/

// Example 3: Find mergeable classes
/*
const mergeable = findMergeableClasses(schedule, branches);
// Returns: [
//   {
//     teacher: "Mr. John",
//     subject: "Mathematics",
//     sections: ["A", "B"],
//     period: "10:00 AM",
//     count: 2
//   }
// ]
*/

export const MERGED_CLASSES_FEATURE = {
  name: "Merged Classes",
  version: "1.0",
  description: "Allow one teacher to teach multiple sections in same period",
  status: "implemented",
  components: [
    "MergeClassesDialog",
    "TimetableGrid (updated)",
    "TimetablesList (updated)",
  ],
  utilities: [
    "mergeClassesForTeacher",
    "unmergeClass",
    "findMergeableClasses",
    "getTeachersWithMultipleClasses",
    "isValidMerge",
  ],
};
