import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { matiere } from '../types';

export default function TutorRegistration() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<matiere[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<matiere[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<matiere[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userDetails, setUserDetails] = useState<{
    preorientation: any;
    annee: number;
    departement: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setError("Utilisateur non connecté");
        setIsLoading(false);
        return;
      }

      try {
        // 1. Récupération des infos utilisateur
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('year, departement')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          throw new Error("Erreur lors de la récupération des informations utilisateur");
        }

        setUserDetails({
          preorientation: null, // Adding the required property
          annee: userData.year,
          departement: userData.departement.toLowerCase()
        });

        // 2. Récupération de toutes les matières
        const { data: matiereData, error: matiereError } = await supabase
          .from('matiere')
          .select('*');

        if (matiereError) {
          throw new Error("Erreur lors de la récupération des matières");
        }

        setSubjects(matiereData || []);

        // 3. Récupération des matières sélectionnées
        const { data: tutorData } = await supabase
          .from('tutor')
          .select('matieres')
          .eq('user_id', user.id)
          .single();

        if (tutorData?.matieres) {
          const selected = matiereData?.filter(subject => 
            tutorData.matieres.some((m: any) => 
              m.nom === subject.nom && 
              m.departement === subject.departement && 
              m.annee === subject.annee
            )
          ) || [];
          setSelectedSubjects(selected);
        }

      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : "Erreur de base de données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (userDetails && subjects.length > 0) {      
      const filtered = subjects.filter(subject => {
        const subjectDept = subject.departement.toLowerCase();
        const userDept = userDetails.departement.toLowerCase();
        // Récupérer la préorientation seulement pour les 2A
        const userPreorientation = userDetails.annee === 2 ? userDetails.preorientation?.toLowerCase() : undefined;

        if (subject.annee > userDetails.annee) return false;
        
        // Cas 1A - Uniquement matières STPI 1A
        if (userDetails.annee === 1) {
          return subjectDept === 'stpi' && subject.annee === 1;
        }
        
        // Cas 2A - Matières STPI communes 2A + matières de préorientation 2A
        if (userDetails.annee === 2) {
          if (subjectDept === 'stpi' && subject.annee === 2) return true;
          return userPreorientation && subjectDept === userPreorientation && subject.annee === 2;
        }
        
        // Cas 3A+ - Matières de leur département et STPI des années inférieures
        if (subjectDept === 'stpi' && subject.annee < userDetails.annee) return true;
        if (subjectDept === userDept) return true;
        
        return false;
      });

      setFilteredSubjects(filtered);
    }
  }, [subjects, userDetails]);

  const handleSubjectToggle = (subject: matiere) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => 
        s.nom === subject.nom && 
        s.departement === subject.departement && 
        s.annee === subject.annee
      );
      
      return isSelected
        ? prev.filter(s => 
            !(s.nom === subject.nom && 
            s.departement === subject.departement && 
            s.annee === subject.annee)
          )
        : [...prev, subject];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const subjectsToStore = selectedSubjects.map(s => ({
        nom: s.nom,
        departement: s.departement,
        annee: s.annee
      }));

      const { error: upsertError } = await supabase
        .from('tutor')
        .upsert({
          user_id: user.id,
          matieres: subjectsToStore
        });

      if (upsertError) throw upsertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!userDetails) return <div>Informations utilisateur non disponibles</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Inscription Tuteur</h2>
      <p className="mb-6">
        Vous êtes en {userDetails.annee}A - Département {userDetails.departement.toUpperCase()}
      </p>

      {success && (
        <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">
          Vos choix ont été enregistrés avec succès !
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Matières disponibles</h3>
          <div className="space-y-2">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map(subject => {
                const isSelected = selectedSubjects.some(s => 
                  s.nom === subject.nom && 
                  s.departement === subject.departement && 
                  s.annee === subject.annee
                );

                return (
                  <div 
                    key={`${subject.nom}-${subject.departement}-${subject.annee}`}
                    className="flex items-center p-3 border rounded hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      id={`${subject.nom}-${subject.departement}-${subject.annee}`}
                      checked={isSelected}
                      onChange={() => handleSubjectToggle(subject)}
                      className="mr-3 h-5 w-5"
                    />
                    <label 
                      htmlFor={`${subject.nom}-${subject.departement}-${subject.annee}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{subject.nom}</div>
                      <div className="text-sm text-gray-600">
                        {subject.departement.toUpperCase()} - Année {subject.annee}
                      </div>
                    </label>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">Aucune matière disponible pour votre département/année</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">{selectedSubjects.length}</span> matière(s) sélectionnée(s)
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Enregistrement..." : "Enregistrer mes choix"}
          </button>
        </div>
      </form>
    </div>
  );
}