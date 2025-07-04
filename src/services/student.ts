import { supabase } from '../lib/supabase';
import { matiere } from '../types';

/**
 * Récupère les matières pour un étudiant basé sur son année et département
 */
export async function getStudentSubjects(userId: string) {
  try {
    // 1. Récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('year, departement, preorientation')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("Utilisateur non trouvé");

    const { year, departement, preorientation } = userData;

    // 2. Récupérer les matières appropriées
    let query = supabase
      .from('matiere')
      .select('*');

    // Si l'étudiant est en 1ère ou 2ème année, il est en STPI
    if (year <= 2) {
      query = query.eq('departement', 'stpi').eq('annee', year);
      
      // Si l'étudiant est en 2A et a une préorientation, ajouter les matières de préorientation
      if (year === 2 && preorientation) {
        const { data: preorientationData } = await supabase
          .from('matiere')
          .select('*')
          .eq('departement', preorientation)
          .eq('annee', 2);
          
        const { data: stpiData } = await query;
        
        return {
          subjects: [...(stpiData || []), ...(preorientationData || [])],
          userDetails: { year, departement, preorientation }
        };
      }
    } else {
      // Pour les années 3+, filtrer par département
      query = query.eq('departement', departement).eq('annee', year);
    }

    const { data: subjects, error: subjectsError } = await query;
    
    if (subjectsError) throw subjectsError;
    
    return {
      subjects: subjects || [],
      userDetails: { year, departement, preorientation }
    };
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    throw error;
  }
}

/**
 * Récupère les tuteurs disponibles pour une matière spécifique
 */
export async function getTutorsForSubject(subject: matiere) {
  try {
    // Récupérer tous les tuteurs avec leurs matières
    const { data: tutorData, error: tutorError } = await supabase
      .from('tutor')
      .select('id, user_id, matieres');
    
    if (tutorError) throw tutorError;
    if (!tutorData || tutorData.length === 0) return [];

    // Déboguer les matières des tuteurs
    console.log('Matières des tuteurs:', tutorData.map(t => t.matieres));
    
    // Filtrer les tuteurs qui ont cette matière dans leur liste
    const tutorsWithSubject = tutorData.filter(tutor => {
      if (!Array.isArray(tutor.matieres) || tutor.matieres.length === 0) return false;
      
      // Parcourir chaque élément des matières
      return tutor.matieres.some((matiereString: string) => {
        // Les matières sont stockées sous forme de chaînes JSON
        try {
          // Essayer de parser la chaîne JSON
          const matiereObj = JSON.parse(matiereString);
          return matiereObj.nom === subject.nom && 
                matiereObj.departement === subject.departement && 
                matiereObj.annee === subject.annee;
        } catch (e) {
          // Si ce n'est pas du JSON valide, comparer directement
          return matiereString === subject.nom;
        }
      });
    });

    if (tutorsWithSubject.length === 0) {
      console.log('Aucun tuteur trouvé pour cette matière');
      return [];
    }
    
    console.log('Tuteurs trouvés:', tutorsWithSubject.length);

    // Récupérer les détails des utilisateurs tuteurs
    const userIds = tutorsWithSubject.map(tutor => tutor.user_id);
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, year, departement')
      .in('id', userIds);

    if (usersError) throw usersError;

    // Combiner les données
    return tutorsWithSubject.map(tutor => {
      const userDetails = usersData?.find(user => user.id === tutor.user_id);
      return {
        id: tutor.id,
        user_id: tutor.user_id,
        name: userDetails?.name || 'Inconnu',
        email: userDetails?.email || '',
        year: userDetails?.year || 0,
        departement: userDetails?.departement || ''
      };
    });
  } catch (error) {
    console.error('Error fetching tutors for subject:', error);
    throw error;
  }
}

/**
 * Enregistre un étudiant qui souhaite recevoir du tutorat pour une matière
 */
export async function registerStudentForTutoring(userId: string, matiereData: matiere) {
  try {
    // 1. Vérifier si l'étudiant existe déjà dans la table student
    const { data: existingStudent, error: checkError } = await supabase
      .from('student')
      .select('id, matieres')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // Convertir la matière en format JSON string 
    const matiereJson = JSON.stringify({
      nom: matiereData.nom,
      departement: matiereData.departement,
      annee: matiereData.annee
    });
    
    if (existingStudent) {
      // 2a. Si l'étudiant existe, mettre à jour ses matières
      const updatedMatieres = existingStudent.matieres || [];
      
      // Vérifier si la matière n'est pas déjà dans la liste
      const matiereExists = updatedMatieres.some((m: string) => {
        try {
          const parsed = JSON.parse(m);
          return parsed.nom === matiereData.nom && 
                 parsed.departement === matiereData.departement &&
                 parsed.annee === matiereData.annee;
        } catch {
          return false;
        }
      });
      
      if (!matiereExists) {
        updatedMatieres.push(matiereJson);
        
        const { error: updateError } = await supabase
          .from('student')
          .update({ matieres: updatedMatieres })
          .eq('id', existingStudent.id);
          
        if (updateError) throw updateError;
      }
      
      return { updated: true, id: existingStudent.id };
    } else {
      // 2b. Si l'étudiant n'existe pas, le créer avec cette matière
      const { data: newStudent, error: insertError } = await supabase
        .from('student')
        .insert({ 
          user_id: userId,
          matieres: [matiereJson]
        })
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      return { updated: false, id: newStudent.id };
    }
  } catch (error) {
    console.error('Error registering student for tutoring:', error);
    throw error;
  }
}