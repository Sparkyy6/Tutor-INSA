import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import LandingPage from '../components/LandingPage';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import Home from '../components/Home';
import TutorRegistration from '../components/TutorRegistration';

const AppRoutes: React.FC = () => {
  const { user, isLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = React.useState<'home' | 'login' | 'register'>('home');
  
  // Afficher un indicateur de chargement lors de la vérification de l'authentification
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }
  
  // Si utilisateur connecté, utiliser Router
  if (user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Home user={{ ...user, departement: user.departement ?? '' }} onLogout={signOut} />} />
          <Route path="/become-tutor" element={<TutorRegistration />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }
  
  // Différentes vues pour utilisateur non connecté
  return (
    <Layout>
      {currentView === 'home' && (
        <LandingPage 
          onLogin={() => setCurrentView('login')} 
          onRegister={() => setCurrentView('register')} 
        />
      )}
      
      {currentView === 'login' && (
        <LoginForm 
          onSwitch={() => setCurrentView('register')} 
          onBack={() => setCurrentView('home')} 
        />
      )}
      
      {currentView === 'register' && (
        <RegisterForm 
          onSwitch={() => setCurrentView('login')} 
          onBack={() => setCurrentView('home')} 
        />
      )}
    </Layout>
  );
};

export default AppRoutes;