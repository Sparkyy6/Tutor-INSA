import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

interface Matiere {
  nom: string;
  departement: string;
  annee: number;
}

interface TutorData {
  id: string;
  user_id: string;
  matieres: Matiere[];
  created_at: string;
}

interface StudentData {
  id: string;
  user_id: string;
  matieres: Matiere[];
  created_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tutorData, setTutorData] = useState<TutorData | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setError('Utilisateur non connecté');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Requête optimisée pour récupérer les données en une seule opération
        const { data, error: queryError } = await supabase
          .from('tutor')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = aucun résultat
          throw queryError;
        }

        setTutorData(data);

        // Même chose pour student
        const { data: studentData, error: studentError } = await supabase
          .from('student')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (studentError && studentError.code !== 'PGRST116') {
          throw studentError;
        }

        setStudentData(studentData);

      } catch (error) {
        console.error('Erreur détaillée:', error);
        setError("Erreur lors du chargement du profil. Veuillez rafraîchir la page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Force un recalcul en récupérant les données à nouveau
      const { data: freshTutorData } = await supabase
        .from('tutor')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setTutorData(freshTutorData);
    } catch (refreshError) {
      console.error('Erreur de rafraîchissement:', refreshError);
      setError("Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMatieres = (matieres: Matiere[], role: 'tutor' | 'student') => {
    if (!matieres || matieres.length === 0) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">Aucune matière enregistrée</p>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          {role === 'tutor' ? 'Matières enseignées' : 'Matières suivies'} ({matieres.length})
        </h3>
        <ul className="space-y-2">
          {matieres.map((matiere, index) => (
            <li 
              key={index} 
              className={`${role === 'tutor' ? 'bg-blue-50' : 'bg-green-50'} rounded-lg p-3`}
            >
              <p className={`font-medium ${role === 'tutor' ? 'text-blue-800' : 'text-green-800'}`}>
                {matiere.nom}
              </p>
              <p className={`text-sm ${role === 'tutor' ? 'text-blue-600' : 'text-green-600'}`}>
                {matiere.departement?.toUpperCase()} - Année {matiere.annee}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Chargement des informations utilisateur...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Rafraîchir
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rafraîchir
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section Informations personnelles */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">
            Informations personnelles
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Nom complet</label>
              <p className="mt-1 text-lg font-medium text-gray-800">{user.name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-lg font-medium text-gray-800">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Département</label>
              <p className="mt-1 text-lg font-medium text-gray-800">
                {user.departement?.toUpperCase() || '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Année</label>
              <p className="mt-1 text-lg font-medium text-gray-800">
                {user.year ? `${user.year}A` : '-'}
              </p>
            </div>
            {user.preorientation && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Préorientation</label>
                <p className="mt-1 text-lg font-medium text-gray-800">
                  {user.preorientation.toUpperCase()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section Rôles */}
        <div className="space-y-6">
          {/* Section Tuteur */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h2 className="text-xl font-semibold text-gray-700">Rôle: Tuteur</h2>
              {!tutorData && (
                <Link
                  to="/become-tutor"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Devenir tuteur
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : tutorData ? (
              <>
                {renderMatieres(tutorData.matieres, 'tutor')}
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">Vous n'êtes pas encore tuteur</p>
              </div>
            )}
          </div>

          {/* Section Étudiant */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h2 className="text-xl font-semibold text-gray-700">Rôle: Étudiant</h2>
              {!studentData && (
                <Link
                  to="/find-tutor"
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  Trouver des matières
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : studentData ? (
              <>
                <p className="text-sm text-gray-500">
                  Inscrit comme étudiant depuis: {new Date(studentData.created_at).toLocaleDateString()}
                </p>
                {renderMatieres(studentData.matieres, 'student')}
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">Aucune matière suivie actuellement</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}