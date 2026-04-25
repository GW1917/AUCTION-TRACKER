import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authClient } from './auth';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Results from './pages/Results';
import AuctionSites from './pages/AuctionSites';
import SavedSearches from './pages/SavedSearches';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const { profileMissing, profileLoading } = useAuth();

  if (isPending || profileLoading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (profileMissing) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return null;
  return !session ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"      element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/"
        element={<ProtectedRoute><Layout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<Dashboard />} />
        <Route path="search"         element={<Search />} />
        <Route path="results"        element={<Results />} />
        <Route path="auction-sites"  element={<AuctionSites />} />
        <Route path="saved-searches" element={<SavedSearches />} />
        <Route path="settings"       element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
