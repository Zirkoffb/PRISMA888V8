import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import Login from './pages/Login';
import { Toaster } from '@/components/ui/toaster';
import { useSubdomain } from './hooks/useSubdomain';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { subdomain, isAdmin } = useSubdomain();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="dark">
        <Login />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="dark">
      <Router>
        <Routes>
          {isAdmin ? (
            <Route path="/*" element={<AdminDashboard />} />
          ) : (
            <Route path="/*" element={<CandidateDashboard />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </div>
  );
}
