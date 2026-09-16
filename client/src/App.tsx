import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useSessionBootstrap } from './hooks/useSessionBootstrap';

export default function App() {
  // Restores the session (if any) from the httpOnly refresh cookie on load,
  // since the in-memory access token doesn't survive a page reload.
  useSessionBootstrap();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Further protected routes (dashboard, problems, etc.) are added phase by phase */}
    </Routes>
  );
}
