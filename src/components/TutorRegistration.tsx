import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
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

  if (isLoading) return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
        <div className="h-10 bg-gray-200 rounded w-1/4 mt-6"></div>
      </div>
    </div>
  );

  if (error) return <div className="max-w-4xl mx-auto p-4 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Sélection des matières à tutorer</h2>
      {success && (
        <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">
          Vos choix ont été enregistrés avec succès ! Redirection...
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
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
  );
}