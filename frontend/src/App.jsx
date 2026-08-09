import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";
import PublicLayout from "./layout/PublicLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import RegistrationListPage from "./pages/registration/RegistrationListPage";
import TeamProfilePage from "./pages/registration/TeamProfilePage";
import SubmissionsPage from "./pages/submissions/SubmissionsPage";
import RepositoriesPage from "./pages/repositories/RepositoriesPage";
import RepositoryDetailPage from "./pages/repositories/RepositoryDetailPage";
import JudgesPage from "./pages/judges/JudgesPage";
import JudgeDetailPage from "./pages/judges/JudgeDetailPage";
import EvaluationPage from "./pages/evaluation/EvaluationPage";
import RankingPage from "./pages/ranking/RankingPage";
import SchedulePage from "./pages/schedule/SchedulePage";
import AnnouncementsPage from "./pages/announcements/AnnouncementsPage";
import ResourcesPage from "./pages/resources/ResourcesPage";
import SettingsPage from "./pages/settings/SettingsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import AuditLogsPage from "./pages/auditlogs/AuditLogsPage";
import PublicHomePage from "./pages/public/PublicHomePage";
import PublicRegisterPage from "./pages/public/PublicRegisterPage";
import PublicSubmitPage from "./pages/public/PublicSubmitPage";
import PublicAnnouncementsPage from "./pages/public/PublicAnnouncementsPage";
import PublicResourcesPage from "./pages/public/PublicResourcesPage";
import PublicLinkGithubPage from "./pages/public/PublicLinkGithubPage";
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
      <Route element={<PublicLayout />}>
        <Route index element={<PublicHomePage />} />
        <Route path="/register" element={<PublicRegisterPage />} />
        <Route path="/submit" element={<PublicSubmitPage />} />
        <Route path="/notices" element={<PublicAnnouncementsPage />} />
        <Route path="/downloads" element={<PublicResourcesPage />} />
        <Route path="/link-github" element={<PublicLinkGithubPage />} />
      </Route>

      <Route path="/login" element={<LoginRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/registrations" element={<RegistrationListPage />} />
          <Route path="/registrations/:id" element={<TeamProfilePage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/repositories/:teamId" element={<RepositoryDetailPage />} />
          <Route path="/judges" element={<JudgesPage />} />
          <Route path="/judges/:id" element={<JudgeDetailPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
