import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import FamilySetupPage from '@/pages/FamilySetupPage';
import DashboardPage from '@/pages/DashboardPage';
import BudgetSetupPage from '@/pages/BudgetSetupPage';
import ProfilePage from '@/pages/ProfilePage';

// Redirect logged-in users away from login/register
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Requires family_id to access main app
function FamilyGuard({ children }) {
  const { userProfile, loading, profileLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (profileLoading && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4 max-w-sm px-4 text-center">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-300 text-sm">Preparing your account...</p>
          <button
            type="button"
            onClick={refreshProfile}
            className="text-xs text-purple-300 hover:text-purple-200 underline cursor-pointer"
          >
            Retry profile sync
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <p className="text-gray-300 text-sm">Profile not ready yet.</p>
          <button
            type="button"
            onClick={() => navigate('/family-setup', { replace: true })}
            className="text-xs text-purple-300 hover:text-purple-200 underline cursor-pointer"
          >
            Continue to family setup
          </button>
        </div>
      </div>
    );
  }

  // Use snake_case — matches Supabase column name
  if (!userProfile?.family_id) {
    return <Navigate to="/family-setup" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public-only routes (redirect to dashboard if already logged in) */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      {/* Protected - Family Setup */}
      <Route
        path="/family-setup"
        element={
          <ProtectedRoute>
            <FamilySetupPage />
          </ProtectedRoute>
        }
      />

      {/* Protected - Main App (requires family) */}
      <Route
        element={
          <ProtectedRoute>
            <FamilyGuard>
              <Layout />
            </FamilyGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="budget-setup" element={<BudgetSetupPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
