import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { matiere } from '../types';

const SubjectItem = memo(({ subject, selected, onToggle }: {
  subject: matiere;
  selected: boolean;
  onToggle: (name: string) => void;
}) => (
  <div className="flex items-center p-3 border rounded hover:bg-gray-50">
    <input
      type="checkbox"
      id={subject.nom}
      checked={selected}
      onChange={() => onToggle(subject.nom)}
      className="mr-3"
    />
    <label htmlFor={subject.nom} className="cursor-pointer flex-1">
      <span className="font-medium">{subject.nom}</span>
      <span className="text-sm text-gray-500 block">
        {subject.departement.toUpperCase()} - {subject.annee}A
      </span>
    </label>
  </div>
));

export default function TutorRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<matiere[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [studentSubjects, setStudentSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const subjectsCache = useRef<matiere[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      if (!user?.id || !user.departement || !user.year) {
        setError("Informations utilisateur incomplètes.");
        setIsLoading(false);
        return;
      }

      try {
        // Requête optimisée avec filtrage côté serveur
        const { data: matieres, error: matieresError } = await supabase
          .from('matiere')
          .select('*')
          .or(`departement.eq.${user.departement},departement.eq.stpi`)
          .lte('annee', user.year || 0);

        if (matieresError) throw matieresError;

        // Requête tutor en parallèle
        const { data: tutor, error: tutorError } = await supabase
          .from('tutor')
          .select('matieres')
          .eq('user_id', user.id)
          .maybeSingle();

        if (tutorError && tutorError.code !== 'PGRST116') throw tutorError;

        // Mise en cache pour éviter les rendus inutiles
        if (JSON.stringify(subjectsCache.current) !== JSON.stringify(matieres)) {
          subjectsCache.current = matieres || [];
          setSubjects(matieres || []);
        }

        setSelectedSubjects(tutor?.matieres || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    // Délai minimal pour éviter le flash de chargement
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    async function fetchStudentSubjects() {
      if (!user?.id) return; // Ajouté pour éviter l'erreur
      const { data: student } = await supabase
        .from('student')
        .select('matieres')
        .eq('user_id', user.id)
        .maybeSingle();
      if (student?.matieres) setStudentSubjects(student.matieres);
    }
    if (user?.id) fetchStudentSubjects();
  }, [user]);

  const handleSubjectToggle = useCallback((subjectName: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectName)
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName]
    );
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: tutor, error: tutorError } = await supabase
        .from('tutor')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (tutorError && tutorError.code !== 'PGRST116') throw tutorError;

      const { error } = tutor
        ? await supabase
            .from('tutor')
            .update({ matieres: selectedSubjects })
            .eq('user_id', user.id)
        : await supabase
            .from('tutor')
            .insert([{ user_id: user.id, matieres: selectedSubjects }]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedSubjects, navigate]);

  const filteredSubjects = subjects.filter(
    (subject) => !studentSubjects.includes(subject.nom)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-4 text-center shadow-md">
        <h1 className="text-3xl md:text-4xl font-bold">Tutor'INSA</h1>
      </header>
      
      {/* Main content */}
      <main className="flex-grow py-10 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Devenir tuteur</h2>
            <Link 
              to="/"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded"></div>
                ))}
              </div>
              <div className="h-10 bg-gray-200 rounded w-1/4 mt-6"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Sélection des matières à tutorer</h2>
              {success && (
                <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">
                  Vos choix ont été enregistrés avec succès ! Redirection...
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {filteredSubjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSubjects.map((subject) => (
                      <SubjectItem
                        key={subject.nom}
                        subject={subject}
                        selected={selectedSubjects.includes(subject.nom)}
                        onToggle={handleSubjectToggle}
                      />
                    ))}
                  </div>
                ) : (
                  <p>Aucune matière disponible</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer mes choix"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4 mt-auto text-sm">
        <p>&copy; 2025 INSA Centre-Val de Loire - Plateforme de Tutorat</p>
      </footer>
    </div>
  );
}