import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GuestDashboard from './pages/Guest/BookingPage';
import LoginPage from './pages/Guest/LoginPage';
import RegisterPage from './pages/Guest/RegisterPage';
import AdminDashboard from './pages/Admin/Dashboard';
import NotFound from './pages/NotFound';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const guest = useAuthStore((state) => state.guest);
  if (!guest) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Guest portal - Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <GuestDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin portal (currently unprotected, but can be protected later) */}
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
