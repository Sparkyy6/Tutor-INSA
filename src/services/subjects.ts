import { supabase } from '../lib/supabase';

export async function getAvailableSubjects(departement: string, year: number) {
  try {
    console.log(`Fetching subjects for departement: ${departement}, year: ${year}`);
    
    // Construisons la requête de façon plus sûre
    let query = supabase
      .from('matiere')
      .select('*')
      .lte('annee', year);
    
    // Ajoutons la condition de département si elle est fournie
    if (departement && departement !== 'stpi') {
      query = query.or(`departement.eq.${departement},departement.eq.stpi`);
    }
      
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log(`Retrieved ${data?.length || 0} subjects:`, data);
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