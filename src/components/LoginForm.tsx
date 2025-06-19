import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSwitch: () => void;
  onBack: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch, onBack }) => {
  const { signIn, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null); // Effacer l'erreur lors de la saisie
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await signIn(formData.email, formData.password);
      console.log('Connexion réussie, redirection...');
      // La redirection devrait être gérée par AuthContext après une connexion réussie
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Connexion</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
            autoComplete="email"
            placeholder="prenom.nom@insa-cvl.fr"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
            autoComplete="current-password"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center ${
            isLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
          } text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out mt-6`}
        >
          {isLoading ? (
            <>
              <span className="mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Connexion...
            </>
          ) : 'Se connecter'}
        </button>
      </form>
      
      <div className="text-center mt-6 text-sm text-gray-600">
        <span>Vous n'avez pas de compte ?</span>
        <button
          onClick={onSwitch}
          className="text-red-600 hover:text-red-700 font-medium underline ml-2 focus:outline-none"
        >
          S'inscrire
        </button>
      </div>
      
      <div className="text-center mt-4 text-sm text-gray-600">
        <button
          onClick={onBack}
          className="text-red-600 hover:text-red-700 font-medium underline focus:outline-none"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default LoginForm;