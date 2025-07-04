import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HomeProps {
  user: {
    name: string;
    email: string;
    departement: string;
    year?: number;
    preorientation?: string;
  };
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
      // La redirection se fera automatiquement via les routes protégées
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Tutor'INSA</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bonjour, {user.name}</span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenue sur la plateforme de tutorat !
            </h2>
            <p className="text-gray-600 mb-4">
              Vous êtes connecté en tant qu'étudiant du département {user.departement.toUpperCase()}
              {user.year && ` en ${user.year}ème année`}
              {user.year === 2 && user.preorientation && ` avec une préorientation ${user.preorientation.toUpperCase()}`}.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Prochaine étape :</strong> Choisissez votre rôle (étudiant ou tuteur) 
                    pour commencer à utiliser la plateforme.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Action Trouver un tuteur */}
            <Link to="/find-tutor" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                <span className="text-red-600 text-xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trouver un tuteur</h3>
              <p className="text-gray-600 text-sm">
                Cherchez des tuteurs pour les matières qui vous intéressent
              </p>
            </Link>

            {/* Action Devenir tuteur */}
            <Link to="/become-tutor" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <span className="text-green-600 text-xl">👨‍🏫</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Devenir tuteur</h3>
              <p className="text-gray-600 text-sm">
                Aidez d'autres étudiants dans vos matières fortes
              </p>
            </Link>

            {/* Messagerie */}
            <Link to="/conversations" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <span className="text-blue-600 text-xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Messagerie</h3>
              <p className="text-gray-600 text-sm">
                Accédez à vos conversations avec les tuteurs et étudiants
              </p>
            </Link>

            {/* Nouvelle action: Gérer mes sessions */}
            <Link to="/sessions" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <span className="text-purple-600 text-xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gérer mes sessions</h3>
              <p className="text-gray-600 text-sm">
                Consultez et gérez vos sessions de tutorat programmées
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;