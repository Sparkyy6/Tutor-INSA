import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { clearAuthCookies } from '../lib/cookieManager';
import Layout from '../components/Layout';
import LandingPage from '../components/LandingPage';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import Home from '../components/Home';
import TutorRegistration from '../components/TutorRegistration';
import StudentRegister from '../components/StudentRegister';
import ChatRoom from '../components/ChatRoom';
import ConversationsList from '../components/ConversationsList';

const AppRoutes: React.FC = () => {
  const { user, isLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = React.useState<'home' | 'login' | 'register'>('home');
  const [loadingStartTime] = useState(Date.now());
  
  // Afficher un indicateur de chargement lors de la vérification de l'authentification
  if (isLoading) {
    return (
      <Layout>
        <div 
          className="loading-indicator flex flex-col justify-center items-center h-screen"
          data-loading-start={loadingStartTime}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Chargement en cours...</p>
          
          {/* Afficher un bouton de secours après 8 secondes */}
          {Date.now() - loadingStartTime > 8000 && (
            <button
              className="mt-8 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              onClick={() => {
                clearAuthCookies();
                window.location.reload();
              }}
            >
              Problème de chargement? Cliquez ici
            </button>
          )}
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
          <Route path="/find-tutor" element={<StudentRegister />} />
          <Route path="/chat/:conversationId" element={<ChatRoom />} />
          <Route path="/conversations" element={<ConversationsList />} />
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