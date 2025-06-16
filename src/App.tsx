import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TutorsList from './components/TutorsList';
import Calendar from './components/Calendar';
import Messages from './components/Messages';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import AuthForm from './components/AuthForm';
import LandingPage from './components/LandingPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la plateforme...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Route publique pour la page d'accueil */}
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      
      {/* Route d'authentification */}
      <Route path="/auth" element={!user ? <AuthForm /> : <Navigate to="/dashboard" replace />} />
      
      {/* Routes protégées */}
      {user ? (
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tutors" element={<TutorsList />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/users" element={<AdminPanel />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        } />
      ) : (
        <Route path="*" element={<Navigate to="/" replace />} />
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;