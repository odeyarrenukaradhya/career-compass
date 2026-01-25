import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentQuizzes from "./pages/student/Quizzes";
import QuizAttempt from "./pages/student/QuizAttempt";
import StudentResults from "./pages/student/Results";
import StudentCareer from "./pages/student/Career";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminQuizzes from "./pages/admin/Quizzes";
import CreateQuiz from "./pages/admin/CreateQuiz";
import AdminStudents from "./pages/admin/Students";
import AdminAnalytics from "./pages/admin/Analytics";

// Super Admin Pages
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import SuperAdminQuizzes from "./pages/super-admin/Quizzes";
import SuperAdminUsers from "./pages/super-admin/Users";
import SuperAdminReports from "./pages/super-admin/Reports";
import SuperAdminSettings from "./pages/super-admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
            } />
            <Route path="/student/quizzes" element={
              <ProtectedRoute allowedRoles={['student']}><StudentQuizzes /></ProtectedRoute>
            } />
            <Route path="/student/quiz/:quizCode" element={
              <ProtectedRoute allowedRoles={['student']}><QuizAttempt /></ProtectedRoute>
            } />
            <Route path="/student/results" element={
              <ProtectedRoute allowedRoles={['student']}><StudentResults /></ProtectedRoute>
            } />
            <Route path="/student/career" element={
              <ProtectedRoute allowedRoles={['student']}><StudentCareer /></ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/quizzes" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminQuizzes /></ProtectedRoute>
            } />
            <Route path="/admin/quizzes/create" element={
              <ProtectedRoute allowedRoles={['admin']}><CreateQuiz /></ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>
            } />
            
            {/* Super Admin Routes */}
            <Route path="/super-admin/dashboard" element={
              <ProtectedRoute allowedRoles={['super-admin']}><SuperAdminDashboard /></ProtectedRoute>
            } />
            <Route path="/super-admin/quizzes" element={
              <ProtectedRoute allowedRoles={['super-admin']}><SuperAdminQuizzes /></ProtectedRoute>
            } />
            <Route path="/super-admin/users" element={
              <ProtectedRoute allowedRoles={['super-admin']}><SuperAdminUsers /></ProtectedRoute>
            } />
            <Route path="/super-admin/reports" element={
              <ProtectedRoute allowedRoles={['super-admin']}><SuperAdminReports /></ProtectedRoute>
            } />
            <Route path="/super-admin/settings" element={
              <ProtectedRoute allowedRoles={['super-admin']}><SuperAdminSettings /></ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
