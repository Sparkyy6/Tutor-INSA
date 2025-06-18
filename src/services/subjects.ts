import { supabase } from '../lib/supabase';

export async function getAvailableSubjects(userYear: number, userDepartement: string, userPreorientation?: string) {
  try {
    let query = supabase
      .from('matiere')
      .select('*')
      .lte('annee', userYear); // Only subjects from same or lower years

    // Build department condition
    let departmentConditions = ['stpi']; // Everyone can teach STPI subjects
    
    if (userYear === 2 && userPreorientation) {
      // 2A students can teach subjects from their preorientation
      departmentConditions.push(userPreorientation);
    }
    else if (userYear >= 3 && userDepartement !== 'stpi') {
      // 3A+ students can teach subjects from their department
      departmentConditions.push(userDepartement);
    }

    query = query.in('departement', departmentConditions);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
    
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
}

export async function registerAsTutor(userId: string, subjects: string[]) {
  try {
    // Vérifier si l'utilisateur est déjà un tuteur
    const { data: existingTutor, error: checkError } = await supabase
      .from('tutor')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingTutor) {
      // Mettre à jour le tuteur existant
      const { error: updateError } = await supabase
        .from('tutor')
        .update({ matieres: subjects })
        .eq('user_id', userId);
        
      if (updateError) throw updateError;
      
      return { updated: true, id: existingTutor.id };
    } else {
      // Créer un nouveau tuteur
      const { data: newTutor, error: insertError } = await supabase
        .from('tutor')
        .insert({ user_id: userId, matieres: subjects })
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      return { updated: false, id: newTutor.id };
    }
  } catch (error) {
    console.error('Error registering as tutor:', error);
    throw error;
  }
}