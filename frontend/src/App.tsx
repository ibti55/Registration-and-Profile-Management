import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { SidebarLayout } from "@/components/layout/sidebar-layout"
import { ProtectedRoute, PublicOnlyRoute } from "@/components/protected-route"
import LoginPage from "@/pages/login"
import RegisterPage from "@/pages/register"
import DashboardPage from "@/pages/dashboard"
import ProfilePage from "@/pages/profile"
import CircularsPage from "@/pages/circulars"
import ApplicationsPage from "@/pages/applications"
import NotificationsPage from "@/pages/notifications"
import Landing from "@/pages/landing"
import Settings from "@/pages/settings"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />

        {/* Auth routes (redirect to dashboard if already logged in) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes (require authentication) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<SidebarLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/circulars" element={<CircularsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
