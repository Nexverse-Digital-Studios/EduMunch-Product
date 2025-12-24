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
import Profile from "@/pages/Profile";
import Admissions from "@/pages/Admissions";
import Assignments from "@/pages/Assignments";
import Attendance from "@/pages/Attendance";
import AvailabilitySlots from "@/pages/AvailabilitySlots";
import Batches from "@/pages/Batches";
import Branches from "@/pages/Branches";
import Classes from "@/pages/Classes";
import Doubts from "@/pages/Doubts";
import Employees from "@/pages/Employees";
import Enrollments from "@/pages/Enrollments";
import Feedback from "@/pages/Feedback";
import Grievances from "@/pages/Grievances";
import Inventory from "@/pages/Inventory";
import LeaveManagement from "@/pages/LeaveManagement";
import LectureTemplates from "@/pages/LectureTemplates";
import Notifications from "@/pages/Notifications";
import Payments from "@/pages/Payments";
import Payslips from "@/pages/Payslips";
import PTMRequests from "@/pages/PTMRequests";
import Results from "@/pages/Results";
import Roles from "@/pages/Roles";
import SalaryStructures from "@/pages/SalaryStructures";
import SetRoles from "@/pages/SetRoles";
import Subjects from "@/pages/Subjects";
import SupportTickets from "@/pages/SupportTickets";
import Timetables from "@/pages/Timetables";
import Topics from "@/pages/Topics";
import Users from "@/pages/Users";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

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
                <Route element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  {/* Core Routes - Always Available */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* User Management (Tier 1) */}
                  {FEATURES.users && (
                    <Route 
                      path="/users" 
                      element={
                        <ProtectedRoute requiredModule="users">
                          <Users />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.roles && (
                    <Route 
                      path="/roles" 
                      element={
                        <ProtectedRoute requiredModule="roles">
                          <Roles />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  
                  {/* Admin Only - Set Roles */}
                  {FEATURES.setRoles && (
                    <Route 
                      path="/set-roles" 
                      element={
                        <ProtectedRoute adminOnly>
                          <SetRoles />
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
                    <Route 
                      path="/classes" 
                      element={
                        <ProtectedRoute requiredModule="classes">
                          <Classes />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.sections && (
                    <Route 
                      path="/batches" 
                      element={
                        <ProtectedRoute requiredModule="sections">
                          <Batches />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.subjects && (
                    <Route 
                      path="/subjects" 
                      element={
                        <ProtectedRoute requiredModule="subjects">
                          <Subjects />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.topics && (
                    <Route 
                      path="/topics" 
                      element={
                        <ProtectedRoute requiredModule="topics">
                          <Topics />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  
                  {/* Staff Management (Tier 1) */}
                  {FEATURES.employees && (
                    <Route 
                      path="/employees" 
                      element={
                        <ProtectedRoute requiredModule="employees">
                          <Employees />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  
                  {/* Attendance (Tier 1) */}
                  {FEATURES.attendance && (
                    <Route 
                      path="/attendance" 
                      element={
                        <ProtectedRoute requiredModule="attendance">
                          <Attendance />
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
                          <Timetables />
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
                          <Results />
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
                            <Payments />
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
                        <ProtectedRoute requiredModule="assignments" requiredFeature="assignments">
                          <Assignments />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.doubts && (
                    <Route 
                      path="/doubts" 
                      element={
                        <ProtectedRoute requiredModule="doubts" requiredFeature="doubts">
                          <Doubts />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  
                  {/* Advanced Academic (Tier 2) */}
                  {FEATURES.availabilitySlots && (
                    <Route 
                      path="/availability-slots" 
                      element={
                        <ProtectedRoute requiredModule="availability_slots" requiredFeature="availabilitySlots">
                          <AvailabilitySlots />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.ptmRequests && (
                    <Route 
                      path="/ptm-requests" 
                      element={
                        <ProtectedRoute requiredModule="ptm_requests" requiredFeature="ptmRequests">
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
                        <ProtectedRoute requiredModule="feedback" requiredFeature="feedback">
                          <Feedback />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.grievances && (
                    <Route 
                      path="/grievances" 
                      element={
                        <ProtectedRoute requiredModule="grievances" requiredFeature="grievances">
                          <Grievances />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.supportTickets && (
                    <Route 
                      path="/support-tickets" 
                      element={
                        <ProtectedRoute requiredModule="support_tickets" requiredFeature="supportTickets">
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
                        <ProtectedRoute requiredModule="salary_structures" requiredFeature="salaryStructures">
                          <SalaryStructures />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.payslips && (
                    <Route 
                      path="/payslips" 
                      element={
                        <ProtectedRoute requiredModule="payslips" requiredFeature="payslips">
                          <Payslips />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.workingHours && (
                    <Route 
                      path="/working-hours" 
                      element={
                        <ProtectedRoute requiredModule="working_hours" requiredFeature="workingHours">
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
                        <ProtectedRoute requiredModule="branches" requiredFeature="branches">
                          <Branches />
                        </ProtectedRoute>
                      } 
                    />
                  )}
                  {FEATURES.tieUpSchools && (
                    <Route 
                      path="/tie-up-schools" 
                      element={
                        <ProtectedRoute requiredModule="tie_up_schools" requiredFeature="tieUpSchools">
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
                        <ProtectedRoute requiredModule="inventory" requiredFeature="inventory">
                          <Inventory />
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
