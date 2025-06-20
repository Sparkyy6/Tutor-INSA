import { supabase } from '../lib/supabase';
import { sendMessage } from './chat';

// Types pour les sessions
export interface SessionRequest {
  conversationId: string;
  senderId: string;
  receiverId: string;
  subject: string;
  date: Date;
  duration: number;
}

export interface SessionResponse {
  sessionId: string;
  status: 'attente' | 'oui' | 'non';
}

// Créer une demande de session
export async function createSessionRequest(request: SessionRequest) {
  try {
    // Déterminer qui est l'étudiant et qui est le tuteur
    const { data: conversation, error: convError } = await supabase
      .from('conversation')
      .select('student_id, tutor_id, subject')
      .eq('id', request.conversationId)
      .single();
    
    if (convError) throw convError;
    
    // Récupérer les IDs des entrées student et tutor
    const { data: studentData, error: studentError } = await supabase
      .from('student')
      .select('id')
      .eq('user_id', conversation.student_id)
      .single();
      
    if (studentError) throw studentError;
    
    const { data: tutorData, error: tutorError } = await supabase
      .from('tutor')
      .select('id')
      .eq('user_id', conversation.tutor_id)
      .single();
      
    if (tutorError) throw tutorError;
    
    // Récupérer l'information sur la matière
    // Extraire le nom de la matière
    const subjectName = conversation.subject?.split('-')[0]?.trim() || '';
    
    // Récupérer les détails de la matière depuis la table matiere
    const { data: matiereData, error: matiereError } = await supabase
      .from('matiere')
      .select('*')
      .eq('nom', subjectName)
      .limit(1)
      .single();
    
    if (matiereError) {
      console.error('Erreur récupération matière:', matiereError);
      throw new Error('Impossible de trouver cette matière dans la base de données');
    }
    
    // Créer un message pour notifier de la demande
    const messageContent = `📅 Demande de rendez-vous: ${request.date.toLocaleString('fr-FR')} (durée: ${request.duration} minutes)`;
    await sendMessage(request.conversationId, request.senderId, messageContent);
    
    // Insérer la session avec les informations correctes de la matière
    const { data: session, error } = await supabase
      .from('session')
      .insert({
        eleve: studentData.id,
        tuteur: tutorData.id,
        matiere_nom: matiereData.nom,
        matiere_departement: matiereData.departement,
        matiere_annee: matiereData.annee,
        date: request.date.toISOString(),
        duree: request.duration,
        statue: 'attente'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return session;
  } catch (error) {
    console.error('Error creating session request:', error);
    throw error;
  }
}

// Répondre à une demande de session
export async function respondToSessionRequest(
  sessionId: string, 
  conversationId: string, 
  responderId: string, 
  accepted: boolean
) {
  try {
    const status = accepted ? 'oui' : 'non';
    
    // Mettre à jour la session
    const { error } = await supabase
      .from('session')
      .update({ statue: status })
      .eq('id', sessionId);
      
    if (error) throw error;
    
    // Envoyer un message de confirmation
    const messageContent = accepted 
      ? '✅ J\'ai accepté la demande de rendez-vous!' 
      : '❌ Désolé, je dois décliner la demande de rendez-vous.';
    
    await sendMessage(conversationId, responderId, messageContent);
    
    return { sessionId, status };
  } catch (error) {
    console.error('Error responding to session request:', error);
    throw error;
  }
}

// Récupérer les sessions liées à une conversation
export async function getSessionsForConversation(conversationId: string) {
  try {
    // 1. D'abord, récupérer la conversation pour obtenir les IDs de l'étudiant et du tuteur
    const { data: conversation, error: convError } = await supabase
      .from('conversation')
      .select('student_id, tutor_id')
      .eq('id', conversationId)
      .single();
      
    if (convError) throw convError;
    
    // 2. Obtenir les IDs des entrées élève et tuteur
    const { data: student, error: studentError } = await supabase
      .from('student')
      .select('id')
      .eq('user_id', conversation.student_id)
      .single();
      
    if (studentError) throw studentError;
    
    const { data: tutor, error: tutorError } = await supabase
      .from('tutor')
      .select('id')
      .eq('user_id', conversation.tutor_id)
      .single();
      
    if (tutorError) throw tutorError;
    
    // 3. Récupérer les sessions où ces élèves et tuteurs sont impliqués
    // Suppression de la relation 'message:message(*)' qui n'existe pas
    const { data, error } = await supabase
      .from('session')
      .select('*')  // Sans la relation message qui n'existe pas
      .eq('eleve', student.id)
      .eq('tuteur', tutor.id)
      .order('date', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting sessions for conversation:', error);
    return []; // Retourner un tableau vide au lieu de propager l'erreur
  }
}