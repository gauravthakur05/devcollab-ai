import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MyTasksPage from './pages/MyTasksPage';
import KanbanPage from './pages/KanbanPage';
import SprintsPage from './pages/SprintsPage';
import AICodeReviewPage from './pages/AICodeReviewPage';
import AIBugDetectionPage from './pages/AIBugDetectionPage';
import CommitGeneratorPage from './pages/CommitGeneratorPage';
import TeamChatPage from './pages/TeamChatPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
      <Route path="/my-tasks" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
      <Route path="/kanban" element={<ProtectedRoute><KanbanPage /></ProtectedRoute>} />
      <Route path="/sprints" element={<ProtectedRoute><SprintsPage /></ProtectedRoute>} />
      <Route path="/ai/code-review" element={<ProtectedRoute><AICodeReviewPage /></ProtectedRoute>} />
      <Route path="/ai/bug-detection" element={<ProtectedRoute><AIBugDetectionPage /></ProtectedRoute>} />
      <Route path="/ai/commit-generator" element={<ProtectedRoute><CommitGeneratorPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><TeamChatPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
