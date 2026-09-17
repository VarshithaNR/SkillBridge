import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailsPage from './pages/ProblemDetailsPage';
import CreateProblemPage from './pages/CreateProblemPage';
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

        {/* Further protected routes (dashboard, proposals, etc.) are added phase by phase */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
