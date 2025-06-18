import { supabase } from '../lib/supabase';
import { Message } from '../types/chat.types';

/**
 * Récupère tous les messages d'une conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('message')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data || [];
}

/**
 * Envoie un message dans une conversation
 */
export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
  const { data, error } = await supabase
    .from('message')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return data;
}

/**
 * Crée ou récupère une conversation entre un étudiant et un tuteur
 */
export async function createOrGetConversation(studentId: string, tutorId: string, subject: string) {
  try {
    console.log('Creating conversation between:', { studentId, tutorId, subject });
    
    // Vérifier si une conversation existe déjà
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversation')
      .select('*')
      .eq('student_id', studentId)
      .eq('tutor_id', tutorId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // Si la conversation existe, la retourner
    if (existingConversation) {
      return existingConversation;
    }

    // Sinon, créer une nouvelle conversation
    const { data: newConversation, error: insertError } = await supabase
      .from('conversation')
      .insert({
        student_id: studentId,
        tutor_id: tutorId,
        subject
      })
      .select()
      .single();

    if (insertError) throw insertError;
    
    return newConversation;
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    throw error;
  }
}

/**
 * Récupère les détails d'une conversation
 */
export async function getConversationDetails(conversationId: string, currentUserId: string) {
  // Récupérer la conversation
  const { data: conversation, error } = await supabase
    .from('conversation')
    .select(`
      id,
      subject,
      student_id,
      tutor_id,
      students:users!student_id(name),
      tutors:users!tutor_id(name)
    `)
    .eq('id', conversationId)
    .single();

  if (error) throw error;
  
  // Déterminer qui est l'autre utilisateur
  const isStudent = conversation.student_id === currentUserId;
  const otherUserId = isStudent ? conversation.tutor_id : conversation.student_id;
  const otherUserName = isStudent ? conversation.tutors[0]?.name : conversation.students[0]?.name;

  return {
    subject: conversation.subject,
    otherUserId,
    otherUserName
  };
}

/**
 * Récupère toutes les conversations d'un utilisateur
 */
export async function getUserConversations(userId: string) {
  // Récupérer toutes les conversations où l'utilisateur est impliqué
  const { data: conversations, error } = await supabase
    .from('conversation')
    .select(`
      id,
      subject,
      student_id,
      tutor_id,
      students:users!student_id(name),
      tutors:users!tutor_id(name),
      message(id, content, created_at, sender_id)
    `)
    .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Si pas de conversations
  if (!conversations) return [];

  // Formater les données pour l'affichage
  return conversations.map(conv => {
    const isStudent = conv.student_id === userId;
    const otherUserName = isStudent 
      ? (conv.tutors && conv.tutors.length > 0 ? conv.tutors[0].name : 'Inconnu')
      : (conv.students && conv.students.length > 0 ? conv.students[0].name : 'Inconnu');
    
    // Trier les messages pour obtenir le dernier
    const messages = Array.isArray(conv.message) 
      ? conv.message.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      : [];
    
    const lastMessage = messages.length > 0 ? messages[0] : null;
    
    // Pas besoin de vérifier read puisque cette colonne n'existe pas
    const unreadCount = messages.filter(msg => msg.sender_id !== userId).length;

    return {
      id: conv.id,
      subject: conv.subject || 'Sans sujet',
      other_user_name: otherUserName,
      last_message: lastMessage ? lastMessage.content : 'Aucun message',
      last_message_time: lastMessage 
        ? new Date(lastMessage.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '',
      unread_count: unreadCount  // Utiliser tous les messages non envoyés par l'utilisateur comme "non lus"
    };
  });
}