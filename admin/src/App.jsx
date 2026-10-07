// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLoginPage from "./Components/AdminLoginPage";
import AdminDashboard from "./Components/AdminDashboard";
import ReportManagement from "./Components/ReportManagement";
import UserManagementPage from "./Components/UserManagement";
import AnalyticsPage from "./Components/Analytics";
import SettingsPage from "./Components/Settings";
import AssignStaff from "./Components/AssignStaff"; // ✅ Added AssignStaff import

const isAuthenticated = () => !!localStorage.getItem("adminToken");

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/AdminLoginPage" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/AdminLoginPage" replace />} />

        {/* Admin Login */}
        <Route path="/AdminLoginPage" element={<AdminLoginPage />} />

        {/* Admin Dashboard */}
        <Route
          path="/AdminDashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Report Management Page */}
        <Route
          path="/ReportManagement"
          element={
            <ProtectedRoute>
              <ReportManagement />
            </ProtectedRoute>
          }
        />

        {/* Assign Staff Page */}
        <Route
          path="/AssignStaff"
          element={
            <ProtectedRoute>
              <AssignStaff />
            </ProtectedRoute>
          }
        />

        {/* User Management Page */}
        <Route
          path="/UserManagement"
          element={
            <ProtectedRoute>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Analytics Page */}
        <Route
          path="/Analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Settings Page */}
        <Route
          path="/Settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/AdminLoginPage" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
