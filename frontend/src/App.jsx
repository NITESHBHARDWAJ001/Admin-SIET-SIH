import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import RegistrationListPage from "./pages/registration/RegistrationListPage";
import TeamProfilePage from "./pages/registration/TeamProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuth } from "./hooks/useAuth";

function LoginRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/registrations" element={<RegistrationListPage />} />
          <Route path="/registrations/:id" element={<TeamProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
