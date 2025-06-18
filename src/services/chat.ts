import { supabase } from '../lib/supabase';
import { Message } from '../types/chat.types'; // <-- Conversation retiré

// Crée ou récupère une conversation entre un étudiant et un tuteur
export async function createOrGetConversation(student_id: string, tutor_id: string, subject?: string) {
  // Vérifie si une conversation existe déjà
  let { data, error } = await supabase
    .from('conversation')
    .select('*')
    .eq('student_id', student_id)
    .eq('tutor_id', tutor_id)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  // Sinon, crée la conversation
  const { data: newConv, error: insertError } = await supabase
    .from('conversation')
    .insert({ student_id, tutor_id, subject })
    .select()
    .single();

  if (insertError) throw insertError;
  return newConv;
}

// Récupère les messages d'une conversation
export async function getMessages(conversation_id: string) {
  const { data, error } = await supabase
    .from('message')
    .select('*')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Message[];
}

// Envoie un message
export async function sendMessage(conversation_id: string, sender_id: string, content: string) {
  const { data, error } = await supabase
    .from('message')
    .insert({ conversation_id, sender_id, content })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}