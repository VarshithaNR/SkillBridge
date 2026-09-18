import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailsPage from './pages/ProblemDetailsPage';
import CreateProblemPage from './pages/CreateProblemPage';
import MyProposalsPage from './pages/MyProposalsPage';
import ProblemProposalsPage from './pages/ProblemProposalsPage';
import DeveloperDashboardPage from './pages/DeveloperDashboardPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useSessionBootstrap } from './hooks/useSessionBootstrap';

export default function App() {
  // Restores the session (if any) from the httpOnly refresh cookie on load,
  // since the in-memory access token doesn't survive a page reload.
  useSessionBootstrap();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problems/:id" element={<ProblemDetailsPage />} />
        <Route
          path="/problems/create"
          element={
            <ProtectedRoute allowedRoles={['business']}>
              <CreateProblemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/problems/:id/proposals"
          element={
            <ProtectedRoute allowedRoles={['business', 'admin']}>
              <ProblemProposalsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/proposals"
          element={
            <ProtectedRoute allowedRoles={['developer']}>
              <MyProposalsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Dashboard shell: sidebar + top header, one per role. */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/developer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['developer']}>
              <DeveloperDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/dashboard"
          element={
            <ProtectedRoute allowedRoles={['business']}>
              <BusinessDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Project workspace — any authenticated member (business/developer/admin). */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
