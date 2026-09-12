import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Student pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { MyCoursesPage } from './pages/student/MyCoursesPage';
import { CourseDetailPage } from './pages/student/CourseDetailPage';
import { AssessmentsPage } from './pages/student/AssessmentsPage';
import { RecommendationsPage } from './pages/student/RecommendationsPage';
import { MyMentorPage } from './pages/student/MyMentorPage';
import { ProgressPage } from './pages/student/ProgressPage';

// Teacher pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { StudentsListPage } from './pages/teacher/StudentsListPage';
import { RiskMonitorPage } from './pages/teacher/RiskMonitorPage';
import { CourseManagementPage } from './pages/teacher/CourseManagementPage';
import { TeacherAssessmentsPage } from './pages/teacher/TeacherAssessmentsPage';
import { MentorshipOverviewPage } from './pages/teacher/MentorshipOverviewPage';
import { InterventionsOverviewPage } from './pages/teacher/InterventionsOverviewPage';
import { PredictiveAnalyticsPage } from './pages/teacher/PredictiveAnalyticsPage';
import { TeacherProfilePage } from './pages/teacher/TeacherProfilePage';

// Mentor pages
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { MentorStudentsPage } from './pages/mentor/MentorStudentsPage';
import { MentorSessionsPage } from './pages/mentor/MentorSessionsPage';
import { MentorProfilePage } from './pages/mentor/MentorProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to user's natural dashboard
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="courses" element={<MyCoursesPage />} />
            <Route path="courses/:courseId" element={<CourseDetailPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="mentor" element={<MyMentorPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Teacher Protected Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="students" element={<StudentsListPage />} />
            <Route path="risk-monitor" element={<RiskMonitorPage />} />
            <Route path="courses" element={<CourseManagementPage />} />
            <Route path="assessments" element={<TeacherAssessmentsPage />} />
            <Route path="mentorship" element={<MentorshipOverviewPage />} />
            <Route path="interventions" element={<InterventionsOverviewPage />} />
            <Route path="analytics" element={<PredictiveAnalyticsPage />} />
            <Route path="profile" element={<TeacherProfilePage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Mentor Protected Routes */}
          <Route
            path="/mentor"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<MentorDashboard />} />
            <Route path="students" element={<MentorStudentsPage />} />
            <Route path="interventions" element={<InterventionsOverviewPage />} />
            <Route path="sessions" element={<MentorSessionsPage />} />
            <Route path="profile" element={<MentorProfilePage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
