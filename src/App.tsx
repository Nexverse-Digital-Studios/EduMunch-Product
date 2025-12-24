import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Admissions from "@/pages/Admissions";
import Assignments from "@/pages/Assignments";
import Attendance from "@/pages/Attendance";
import AvailabilitySlots from "@/pages/AvailabilitySlots";
import Batches from "@/pages/Batches";
import Branches from "@/pages/Branches";
import Courses from "@/pages/Courses";
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
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admissions" element={<Admissions />} />
                <Route path="/enrollments" element={<Enrollments />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/batches" element={<Batches />} />
                <Route path="/timetables" element={<Timetables />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/results" element={<Results />} />
                <Route path="/lecture-templates" element={<LectureTemplates />} />
                <Route path="/users" element={<Users />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/branches" element={<Branches />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/tie-up-schools" element={<PlaceholderPage />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/salary-structures" element={<SalaryStructures />} />
                <Route path="/payslips" element={<Payslips />} />
                <Route path="/leave-management" element={<LeaveManagement />} />
                <Route path="/working-hours" element={<PlaceholderPage />} />
                <Route path="/availability-slots" element={<AvailabilitySlots />} />
                <Route path="/announcements" element={<PlaceholderPage />} />
                <Route path="/doubts" element={<Doubts />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/grievances" element={<Grievances />} />
                <Route path="/ptm-requests" element={<PTMRequests />} />
                <Route path="/support-tickets" element={<SupportTickets />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
