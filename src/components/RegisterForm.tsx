import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormProps {
  onSwitch: () => void;
  onBack: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch, onBack }) => {
  const { signUp, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    year: '',
    departement: 'stpi',
    preorientation: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation des champs
  const validateEmail = (email: string) => {
    const regex = /^[A-Za-z0-9._%+-]+@insa-cvl\.fr$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    return regex.test(password);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validation en temps réel
    if (name === 'email') {
      setErrors({
        ...errors,
        email: validateEmail(value) ? '' : 'Veuillez utiliser une adresse @insa-cvl.fr'
      });
    }

    if (name === 'password') {
      setErrors({
        ...errors,
        password: validatePassword(value) ? '' : 'Le mot de passe doit contenir 8 caractères minimum, une majuscule, un chiffre et un caractère spécial'
      });
    }

    if (name === 'confirmPassword') {
      setErrors({
        ...errors,
        confirmPassword: value === formData.password ? '' : 'Les mots de passe ne correspondent pas'
      });
    }
  };

  // Gestion dynamique du département en fonction de l'année
  useEffect(() => {
    if ((formData.year === '1' || formData.year === '2') && formData.departement !== 'stpi') {
      setFormData(prev => ({ ...prev, departement: 'stpi' }));
    }
    else if (formData.year !== '' && parseInt(formData.year) >= 3 && formData.departement === 'stpi') {
      setFormData(prev => ({ ...prev, departement: 'gsi' }));
    }
    
    if (formData.year !== '2' && formData.preorientation !== '') {
      setFormData(prev => ({ ...prev, preorientation: '' }));
    }
  }, [formData.year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation finale avant soumission
    if (!validateEmail(formData.email)) {
      alert("Veuillez utiliser une adresse email @insa-cvl.fr valide");
      return;
    }

    if (!validatePassword(formData.password)) {
      alert("Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        year: formData.year ? Number(formData.year) : undefined,
        departement: formData.departement,
        ...(formData.year === '2' && formData.preorientation && { 
          preorientation: formData.preorientation 
        })
      };
      
      await signUp(userData);
      alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      onSwitch();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Inscription</h2>
      <form onSubmit={handleSubmit}>
        {/* Informations personnelles de base */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email INSA-CVL</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            required
            placeholder="prenom.nom@insa-cvl.fr"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            required
            placeholder="8+ caractères, 1 majuscule, 1 chiffre, 1 spécial"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            required
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Informations sur le cursus */}
        <div className="mb-4">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Année d'étude</label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner une année</option>
            <option value="1">1ère année</option>
            <option value="2">2ème année</option>
            <option value="3">3ème année</option>
            <option value="4">4ème année</option>
            <option value="5">5ème année</option>
          </select>
        </div>
        
        {/* Département - désactivé pour 1A et 2A */}
        <div className="mb-4">
          <label htmlFor="departement" className="block text-sm font-medium text-gray-700 mb-1">Département</label>
          <select
            id="departement"
            name="departement"
            value={formData.departement}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
            disabled={formData.year === '1' || formData.year === '2' || formData.year === ''}
          >
            {(formData.year === '1' || formData.year === '2') && (
              <option value="stpi">STPI - Sciences et Techniques Pour l'Ingénieur</option>
            )}
            
            {formData.year !== '' && parseInt(formData.year) >= 3 && (
              <>
                <option value="gsi">GSI - Génie des Systèmes Industriels</option>
                <option value="sti">STI - Sécurité et Technologies Informatiques</option>
                <option value="mri">MRI - Maîtrise des Risques Industriels</option>
              </>
            )}
          </select>
          {formData.year === '1' && (
            <p className="text-xs text-gray-500 mt-1">
              Les étudiants de 1ère année sont automatiquement affectés au département STPI.
            </p>
          )}
          {formData.year === '2' && (
            <p className="text-xs text-gray-500 mt-1">
              Les étudiants de 2ème année sont en STPI avec une préorientation.
            </p>
          )}
        </div>
        
        {/* Préorientation pour les 2A */}
        {formData.year === '2' && (
          <div className="mb-4">
            <label htmlFor="preorientation" className="block text-sm font-medium text-gray-700 mb-1">Préorientation</label>
            <select
              id="preorientation"
              name="preorientation"
              value={formData.preorientation}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner une préorientation</option>
              <option value="gsi">GSI - Génie des Systèmes Industriels</option>
              <option value="sti">STI - Sécurité et Technologies Informatiques</option>
              <option value="mri">MRI - Maîtrise des Risques Industriels</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Sélectionnez votre préorientation en 2ème année.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !!errors.email || !!errors.password || !!errors.confirmPassword}
          className={`w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out mt-6 ${(isLoading || !!errors.email || !!errors.password || !!errors.confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>
      
      <div className="text-center mt-6 text-sm text-gray-600">
        <span>Déjà inscrit ?</span>
        <button
          onClick={onSwitch}
          className="text-red-600 hover:text-red-700 font-medium underline ml-2 focus:outline-none"
        >
          Se connecter
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

export default RegisterForm;