/**
 * EduMunch App Router
 * ====================
 *
 * Main application router with:
 * - Feature-based route registration (disabled features don't have routes)
 * - Permission-based access control
 * - Admin-only routes
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { FEATURES, isFeatureEnabled } from "@/config/features.config";

// Pages
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
// Profile Management Pages (modular)
import { ProfilePage } from "@/pages/profile";
import Admissions from "@/pages/Admissions";
// Assignments Management Pages (modular)
import { AssignmentsList } from "@/pages/assignments";
// Attendance Management Pages (modular)
import { AttendanceList } from "@/pages/attendance";
import AvailabilitySlots from "@/pages/AvailabilitySlots";
import Branches from "@/pages/Branches";
// Doubts Management Pages (modular)
import { DoubtsList } from "@/pages/doubts";
// Employees Management Pages (modular)
import {
  EmployeesList,
  EmployeeCreate,
  EmployeeDetail,
  EmployeeEdit,
} from "@/pages/employees";
// Batches Management Pages (modular)
import {
  BatchesList,
  BatchCreate,
  BatchDetail,
  BatchEdit,
} from "@/pages/batches";
import Enrollments from "@/pages/Enrollments";
import Feedback from "@/pages/Feedback";
import Grievances from "@/pages/Grievances";
// Inventory Management Pages (modular)
import { InventoryList } from "@/pages/inventory";
import LeaveManagement from "@/pages/LeaveManagement";
import LectureTemplates from "@/pages/LectureTemplates";
import Notifications from "@/pages/Notifications";
// Payments Management Pages (modular)
import { PaymentsList } from "@/pages/payments";
import Payslips from "@/pages/Payslips";
import PTMRequests from "@/pages/PTMRequests";
// Results Management Pages (modular)
import { ResultsList } from "@/pages/results";
import SalaryStructures from "@/pages/SalaryStructures";
// Set Roles Management Pages (modular)
import { SetRolesList } from "@/pages/set-roles";
import SupportTickets from "@/pages/SupportTickets";
// Timetables Management Pages (modular)
import { TimetablesList } from "@/pages/timetables";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

// User Management Pages (modular)
import { UsersList, UserCreate, UserDetail, UserEdit } from "@/pages/users";

// Role Management Pages (modular)
import { RolesList, RoleCreate, RoleDetail, RoleEdit } from "@/pages/roles";

// Classes Management Pages (modular)
import {
  ClassesList,
  ClassCreate,
  ClassDetail,
  ClassEdit,
} from "@/pages/classes";

// Subjects Management Pages (modular)
import {
  SubjectsList,
  SubjectCreate,
  SubjectDetail,
  SubjectEdit,
} from "@/pages/subjects";

// Topics Management Pages (modular)
import {
  TopicsList,
  TopicCreate,
  TopicDetail,
  TopicEdit,
} from "@/pages/topics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <PermissionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public route */}
                <Route path="/auth" element={<Auth />} />

                {/* Protected routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Core Routes - Always Available */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* User Management (Tier 1) */}
                  {FEATURES.users && (
                    <>
                      <Route
                        path="/users"
                        element={
                          <ProtectedRoute requiredModule="users">
                            <UsersList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/users/create"
                        element={
                          <ProtectedRoute
                            requiredModule="users"
                            requiredAction="create"
                          >
                            <UserCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/users/:id"
                        element={
                          <ProtectedRoute requiredModule="users">
                            <UserDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/users/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="users"
                            requiredAction="update"
                          >
                            <UserEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                  {FEATURES.roles && (
                    <>
                      <Route
                        path="/roles"
                        element={
                          <ProtectedRoute requiredModule="roles">
                            <RolesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/roles/create"
                        element={
                          <ProtectedRoute
                            requiredModule="roles"
                            requiredAction="create"
                          >
                            <RoleCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/roles/:id"
                        element={
                          <ProtectedRoute requiredModule="roles">
                            <RoleDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/roles/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="roles"
                            requiredAction="update"
                          >
                            <RoleEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Admin Only - Set Roles */}
                  {FEATURES.setRoles && (
                    <Route
                      path="/set-roles"
                      element={
                        <ProtectedRoute adminOnly>
                          <SetRolesList />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Student Management (Tier 1) */}
                  {FEATURES.admissions && (
                    <Route
                      path="/admissions"
                      element={
                        <ProtectedRoute requiredModule="admissions">
                          <Admissions />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Academic Structure (Tier 1) */}
                  {FEATURES.classes && (
                    <>
                      <Route
                        path="/classes"
                        element={
                          <ProtectedRoute requiredModule="classes">
                            <ClassesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/classes/create"
                        element={
                          <ProtectedRoute
                            requiredModule="classes"
                            requiredAction="create"
                          >
                            <ClassCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/classes/:id"
                        element={
                          <ProtectedRoute requiredModule="classes">
                            <ClassDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/classes/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="classes"
                            requiredAction="update"
                          >
                            <ClassEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                  {FEATURES.sections && (
                    <>
                      <Route
                        path="/batches"
                        element={
                          <ProtectedRoute requiredModule="sections">
                            <BatchesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/batches/create"
                        element={
                          <ProtectedRoute
                            requiredModule="sections"
                            requiredAction="create"
                          >
                            <BatchCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/batches/:id"
                        element={
                          <ProtectedRoute requiredModule="sections">
                            <BatchDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/batches/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="sections"
                            requiredAction="update"
                          >
                            <BatchEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                  {FEATURES.subjects && (
                    <>
                      <Route
                        path="/subjects"
                        element={
                          <ProtectedRoute requiredModule="subjects">
                            <SubjectsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/subjects/create"
                        element={
                          <ProtectedRoute
                            requiredModule="subjects"
                            requiredAction="create"
                          >
                            <SubjectCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/subjects/:id"
                        element={
                          <ProtectedRoute requiredModule="subjects">
                            <SubjectDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/subjects/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="subjects"
                            requiredAction="update"
                          >
                            <SubjectEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                  {FEATURES.topics && (
                    <>
                      <Route
                        path="/topics"
                        element={
                          <ProtectedRoute requiredModule="topics">
                            <TopicsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/topics/create"
                        element={
                          <ProtectedRoute
                            requiredModule="topics"
                            requiredAction="create"
                          >
                            <TopicCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/topics/:id"
                        element={
                          <ProtectedRoute requiredModule="topics">
                            <TopicDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/topics/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="topics"
                            requiredAction="update"
                          >
                            <TopicEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Staff Management (Tier 1) */}
                  {FEATURES.employees && (
                    <>
                      <Route
                        path="/employees"
                        element={
                          <ProtectedRoute requiredModule="employees">
                            <EmployeesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees/create"
                        element={
                          <ProtectedRoute
                            requiredModule="employees"
                            requiredAction="create"
                          >
                            <EmployeeCreate />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees/:id"
                        element={
                          <ProtectedRoute requiredModule="employees">
                            <EmployeeDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees/:id/edit"
                        element={
                          <ProtectedRoute
                            requiredModule="employees"
                            requiredAction="update"
                          >
                            <EmployeeEdit />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Attendance (Tier 1) */}
                  {FEATURES.attendance && (
                    <Route
                      path="/attendance"
                      element={
                        <ProtectedRoute requiredModule="attendance">
                          <AttendanceList />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.leaveManagement && (
                    <Route
                      path="/leave-management"
                      element={
                        <ProtectedRoute requiredModule="leave">
                          <LeaveManagement />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Timetable (Tier 1) */}
                  {FEATURES.timetables && (
                    <Route
                      path="/timetables"
                      element={
                        <ProtectedRoute requiredModule="timetable">
                          <TimetablesList />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.lectureTemplates && (
                    <Route
                      path="/lecture-templates"
                      element={
                        <ProtectedRoute requiredModule="lecture_templates">
                          <LectureTemplates />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Exams & Results (Tier 1) */}
                  {FEATURES.results && (
                    <Route
                      path="/results"
                      element={
                        <ProtectedRoute requiredModule="marks">
                          <ResultsList />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Fee Management (Tier 1) */}
                  {FEATURES.payments && (
                    <>
                      <Route
                        path="/payments"
                        element={
                          <ProtectedRoute requiredModule="payments">
                            <PaymentsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/enrollments"
                        element={
                          <ProtectedRoute requiredModule="payments">
                            <Enrollments />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Communication (Tier 1) */}
                  {FEATURES.notifications && (
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute requiredModule="notifications">
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.announcements && (
                    <Route
                      path="/announcements"
                      element={
                        <ProtectedRoute requiredModule="announcements">
                          <PlaceholderPage />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* LMS Features (Tier 2) */}
                  {FEATURES.assignments && (
                    <Route
                      path="/assignments"
                      element={
                        <ProtectedRoute
                          requiredModule="assignments"
                          requiredFeature="assignments"
                        >
                          <AssignmentsList />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.doubts && (
                    <Route
                      path="/doubts"
                      element={
                        <ProtectedRoute
                          requiredModule="doubts"
                          requiredFeature="doubts"
                        >
                          <DoubtsList />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Advanced Academic (Tier 2) */}
                  {FEATURES.availabilitySlots && (
                    <Route
                      path="/availability-slots"
                      element={
                        <ProtectedRoute
                          requiredModule="availability_slots"
                          requiredFeature="availabilitySlots"
                        >
                          <AvailabilitySlots />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.ptmRequests && (
                    <Route
                      path="/ptm-requests"
                      element={
                        <ProtectedRoute
                          requiredModule="ptm_requests"
                          requiredFeature="ptmRequests"
                        >
                          <PTMRequests />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Feedback & Support (Tier 2) */}
                  {FEATURES.feedback && (
                    <Route
                      path="/feedback"
                      element={
                        <ProtectedRoute
                          requiredModule="feedback"
                          requiredFeature="feedback"
                        >
                          <Feedback />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.grievances && (
                    <Route
                      path="/grievances"
                      element={
                        <ProtectedRoute
                          requiredModule="grievances"
                          requiredFeature="grievances"
                        >
                          <Grievances />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.supportTickets && (
                    <Route
                      path="/support-tickets"
                      element={
                        <ProtectedRoute
                          requiredModule="support_tickets"
                          requiredFeature="supportTickets"
                        >
                          <SupportTickets />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* HR & Payroll (Tier 2) */}
                  {FEATURES.salaryStructures && (
                    <Route
                      path="/salary-structures"
                      element={
                        <ProtectedRoute
                          requiredModule="salary_structures"
                          requiredFeature="salaryStructures"
                        >
                          <SalaryStructures />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.payslips && (
                    <Route
                      path="/payslips"
                      element={
                        <ProtectedRoute
                          requiredModule="payslips"
                          requiredFeature="payslips"
                        >
                          <Payslips />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.workingHours && (
                    <Route
                      path="/working-hours"
                      element={
                        <ProtectedRoute
                          requiredModule="working_hours"
                          requiredFeature="workingHours"
                        >
                          <PlaceholderPage />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Multi-Branch (Tier 3) */}
                  {FEATURES.branches && (
                    <Route
                      path="/branches"
                      element={
                        <ProtectedRoute
                          requiredModule="branches"
                          requiredFeature="branches"
                        >
                          <Branches />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  {FEATURES.tieUpSchools && (
                    <Route
                      path="/tie-up-schools"
                      element={
                        <ProtectedRoute
                          requiredModule="tie_up_schools"
                          requiredFeature="tieUpSchools"
                        >
                          <PlaceholderPage />
                        </ProtectedRoute>
                      }
                    />
                  )}

                  {/* Inventory (Tier 3) */}
                  {FEATURES.inventory && (
                    <Route
                      path="/inventory"
                      element={
                        <ProtectedRoute
                          requiredModule="inventory"
                          requiredFeature="inventory"
                        >
                          <InventoryList />
                        </ProtectedRoute>
                      }
                    />
                  )}
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
