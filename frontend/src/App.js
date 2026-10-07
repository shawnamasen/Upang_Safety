// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import UserDashboard from './pages/UserDashboard';
import ReportIncident from './pages/ReportIncident';
import LandingPage from './pages/Landing';
import TrackReports from './pages/TrackReports';
import { UserProvider } from './UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/profile" element={<Profile />} />

          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/report" 
            element={
              <ProtectedRoute>
                <ReportIncident />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/track-reports" 
            element={
              <ProtectedRoute>
                <TrackReports />
              </ProtectedRoute>
            } 
          />

          {/* ✅ Public route for reset password */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}
