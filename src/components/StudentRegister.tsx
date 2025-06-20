import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStudentSubjects, getTutorsForSubject, registerStudentForTutoring } from '../services/student';
import { createOrGetConversation } from '../services/chat';
import { matiere, Tutor } from '../types';
import { supabase } from '../lib/supabase';

export default function StudentRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<matiere[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<{
    year: number;
    departement: string;
    preorientation?: string;
  } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<matiere | null>(null);
  const [availableTutors, setAvailableTutors] = useState<Tutor[]>([]);
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutorSubjects, setTutorSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setError("Utilisateur non connecté");
        setIsLoading(false);
        return;
      }

      try {
        const { subjects, userDetails } = await getStudentSubjects(user.id);
        setSubjects(subjects);
        setUserDetails(userDetails);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : "Erreur lors de la récupération des données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    // Récupère les matières où l'utilisateur est déjà tuteur
    async function fetchTutorSubjects() {
      if (!user?.id) return;
      const { data: tutor, error } = await supabase
        .from('tutor')
        .select('matieres')
        .eq('user_id', user.id)
        .maybeSingle();
      if (tutor?.matieres) setTutorSubjects(tutor.matieres);
    }
    if (user?.id) fetchTutorSubjects();
  }, [user]);

  const handleSelectSubject = async (subject: matiere) => {
    setIsLoadingTutors(true);
    setSelectedSubject(subject);
    setAvailableTutors([]);

    try {
      const tutors = await getTutorsForSubject(subject);
      // Map tutors to match the Tutor type
      const mappedTutors: Tutor[] = tutors.map((tutor: any) => ({
        ...tutor,
        tutor_id: tutor.tutor_id ?? tutor.id, // fallback if tutor_id is missing
        matiere: subject.nom,
      }));
      setAvailableTutors(mappedTutors);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération des tuteurs");
    } finally {
      setIsLoadingTutors(false);
    }
  };

  const handleBookSession = async (tutorId: string) => {
    if (!selectedSubject || !user?.id) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // 1. Enregistrer l'étudiant pour cette matière
      await registerStudentForTutoring(user.id, selectedSubject);
      
      // 2. Créer ou récupérer une conversation entre l'étudiant et le tuteur
      const conversation = await createOrGetConversation(
        user.id, 
        tutorId, 
        selectedSubject.nom
      );
      
      // 3. Rediriger vers le chatroom
      navigate(`/chat/${conversation.id}`);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement de votre demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) => !tutorSubjects.includes(subject.nom)
  );

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-4 text-center shadow-md">
          <h1 className="text-3xl md:text-4xl font-bold">Tutor'INSA</h1>
        </header>
        
        <main className="flex-grow py-10 px-4 md:px-0">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        </main>
        
        <footer className="bg-gray-800 text-white text-center py-4 mt-auto text-sm">
          <p>&copy; 2025 INSA Centre-Val de Loire - Plateforme de Tutorat</p>
        </footer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-4 text-center shadow-md">
          <h1 className="text-3xl md:text-4xl font-bold">Tutor'INSA</h1>
        </header>
        
        <main className="flex-grow py-10 px-4 md:px-0">
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </main>
        
        <footer className="bg-gray-800 text-white text-center py-4 mt-auto text-sm">
          <p>&copy; 2025 INSA Centre-Val de Loire - Plateforme de Tutorat</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-4 text-center shadow-md">
        <h1 className="text-3xl md:text-4xl font-bold">Tutor'INSA</h1>
      </header>
      
      <main className="flex-grow py-10 px-4 md:px-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Rechercher un tuteur</h2>
            <Link 
              to="/"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Liste des matières */}
            <div className="md:w-1/3">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Mes matières</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {userDetails ? (
                    <>
                      {userDetails.year}ème année - {userDetails.departement.toUpperCase()}
                      {userDetails.preorientation && ` (Préorientation: ${userDetails.preorientation.toUpperCase()})`}
                    </>
                  ) : "Informations non disponibles"}
                </p>
                
                {filteredSubjects.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredSubjects.map((subject) => (
                      <li key={`${subject.nom}-${subject.departement}-${subject.annee}`}>
                        <button
                          onClick={() => handleSelectSubject(subject)}
                          className={`w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors border ${
                            selectedSubject && selectedSubject.nom === subject.nom && 
                            selectedSubject.departement === subject.departement && 
                            selectedSubject.annee === subject.annee
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="font-medium">{subject.nom}</div>
                          <div className="text-sm text-gray-600">
                            {subject.departement !== 'stpi' && `${subject.departement.toUpperCase()} - `}
                            Année {subject.annee}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Aucune matière disponible pour votre année/département
                  </div>
                )}
              </div>
            </div>
            
            {/* Liste des tuteurs */}
            <div className="md:w-2/3">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedSubject ? `Tuteurs disponibles pour ${selectedSubject.nom}` : "Sélectionnez une matière"}
                </h2>
                
                {isLoadingTutors ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                  </div>
                ) : selectedSubject ? (
                  availableTutors.length > 0 ? (
                    <ul className="space-y-4">
                      {availableTutors.map((tutor) => (
                        <li key={tutor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h3 className="font-medium text-lg">{tutor.name}</h3>
                              <p className="text-sm text-gray-600">
                                {tutor.year}A - {tutor.departement.toUpperCase()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleBookSession(tutor.user_id)}
                              disabled={isSubmitting}
                              className={`${
                                isSubmitting 
                                  ? 'bg-gray-400' 
                                  : 'bg-red-600 hover:bg-red-700'
                              } text-white px-4 py-2 rounded-md text-sm font-medium transition-colors`}
                            >
                              {isSubmitting ? 'En cours...' : 'Demander une session'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Aucun tuteur disponible pour cette matière</p>
                      <p className="text-sm text-gray-400 mt-2">Essayez une autre matière ou revenez plus tard</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    Veuillez sélectionner une matière pour voir les tuteurs disponibles
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white text-center py-4 mt-auto text-sm">
        <p>&copy; 2025 INSA Centre-Val de Loire - Plateforme de Tutorat</p>
      </footer>
    </div>
  );
}