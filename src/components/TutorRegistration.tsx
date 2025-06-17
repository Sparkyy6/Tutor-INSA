import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAvailableSubjects, registerAsTutor } from '../services/subjects';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface Matiere {
  id?: string;
  nom: string;
  departement: string;
  annee: number;
}

const TutorRegistration: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Matiere[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) {
        setDebugInfo("Utilisateur non connecté");
        setError("Vous devez être connecté pour accéder à cette page");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setDebugInfo(`Récupération des matières pour: ${user.departement || 'stpi'}, année: ${user.year || 1}`);
        
        const data = await getAvailableSubjects(
          user.departement || 'stpi',
          user.year || 1
        );
        
        if (!data || data.length === 0) {
          setDebugInfo("Aucune matière trouvée dans la base de données");
        } else {
          setDebugInfo(`${data.length} matières récupérées`);
        }
        
        setSubjects(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`Impossible de charger les matières disponibles: ${errorMsg}`);
        setDebugInfo(`Erreur: ${errorMsg}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, [user]);

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSubmitLoading(true);
      await registerAsTutor(user.id, selectedSubjects);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Erreur lors de l'enregistrement comme tuteur: ${errorMsg}`);
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Fonction d'aide pour regrouper les matières par département et année
  const groupedSubjects = React.useMemo(() => {
    return subjects.reduce((acc, subject) => {
      const key = `${subject.departement}-${subject.annee}`;
      if (!acc[key]) {
        acc[key] = {
          departement: subject.departement,
          annee: subject.annee,
          matieres: []
        };
      }
      acc[key].matieres.push(subject);
      return acc;
    }, {} as Record<string, { departement: string; annee: number; matieres: Matiere[] }>);
  }, [subjects]);

  if (success) {
    return (
      <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Félicitations!</h2>
          <p className="text-lg text-gray-700 mb-4">
            Votre profil de tuteur a été créé avec succès.
          </p>
          <p className="text-gray-600">Vous allez être redirigé vers la page d'accueil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-gray-600 hover:text-red-700 mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        Retour à l'accueil
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Devenir Tuteur</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <AlertCircle size={20} className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          En tant que tuteur, vous pourrez aider d'autres étudiants dans les matières où vous excellez.
          Sélectionnez les matières pour lesquelles vous souhaitez offrir du tutorat:
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {Object.keys(groupedSubjects).length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <AlertCircle size={20} className="text-yellow-500 mr-2" />
                <div>
                  <p className="text-yellow-700 font-medium">Aucune matière disponible</p>
                  <p className="text-yellow-600 text-sm mt-1">
                    Il n'y a pas de matières disponibles pour votre département et année.
                  </p>
                  <details className="mt-2">
                    <summary className="text-yellow-600 text-sm cursor-pointer">Afficher les détails de débogage</summary>
                    <pre className="text-xs bg-gray-100 p-2 mt-1 rounded">{debugInfo}</pre>
                    <pre className="text-xs bg-gray-100 p-2 mt-1 rounded">
                      Département: {user?.departement || 'non défini'}<br />
                      Année: {user?.year || 'non définie'}<br />
                      Nombre de matières: {subjects.length}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              {Object.values(groupedSubjects)
                .sort((a, b) => a.annee - b.annee || a.departement.localeCompare(b.departement))
                .map((group) => (
                  <div key={`${group.departement}-${group.annee}`} className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                      {group.departement.toUpperCase()} - {group.annee}ème année
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.matieres.map((matiere) => (
                        <div key={`${matiere.id || matiere.nom}-${matiere.departement}-${matiere.annee}`} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${matiere.id || matiere.nom}-${matiere.departement}-${matiere.annee}`}
                            checked={selectedSubjects.includes(matiere.nom)}
                            onChange={() => handleSubjectToggle(matiere.nom)}
                            className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`${matiere.id || matiere.nom}-${matiere.departement}-${matiere.annee}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {matiere.nom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {Object.keys(groupedSubjects).length > 0 && selectedSubjects.length === 0 && (
            <p className="text-amber-600 mb-4 text-sm">
              Veuillez sélectionner au moins une matière pour devenir tuteur.
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={selectedSubjects.length === 0 || submitLoading || Object.keys(groupedSubjects).length === 0}
              className={`px-6 py-2 rounded-md font-medium ${
                selectedSubjects.length === 0 || Object.keys(groupedSubjects).length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {submitLoading ? 'Enregistrement...' : 'Devenir tuteur'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TutorRegistration;