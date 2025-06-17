import React from 'react';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-8 text-gray-800">Plateforme de Tutorat INSA CVL</h2>
      <p className="text-xl mb-12 text-gray-600">
        Connectez-vous ou inscrivez-vous pour accéder à la plateforme d'entraide et de tutorat 
        entre étudiants de l'INSA Centre-Val de Loire.
      </p>
      
      <div className="flex flex-col md:flex-row justify-center gap-6">
        <button 
          onClick={onLogin}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 text-lg"
        >
          Connexion
        </button>
        <button 
          onClick={onRegister}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 text-lg"
        >
          Inscription
        </button>
      </div>
      
      {/* Section avantages */}
      <div className="mt-16 bg-gray-100 p-8 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">Pourquoi utiliser notre plateforme ?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <div className="text-red-600 text-4xl mb-3">📚</div>
            <h4 className="text-lg font-medium mb-2">Entraide entre étudiants</h4>
            <p className="text-gray-600">Trouvez de l'aide auprès d'étudiants plus expérimentés.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md">
            <div className="text-red-600 text-4xl mb-3">🗓️</div>
            <h4 className="text-lg font-medium mb-2">Flexibilité</h4>
            <p className="text-gray-600">Planifiez des séances selon vos disponibilités.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md">
            <div className="text-red-600 text-4xl mb-3">🚀</div>
            <h4 className="text-lg font-medium mb-2">Progression rapide</h4>
            <p className="text-gray-600">Améliorez vos résultats grâce à un suivi personnalisé.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;