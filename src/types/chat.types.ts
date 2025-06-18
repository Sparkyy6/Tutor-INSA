export interface Conversation {
  id: string;
  student_id: string;
  tutor_id: string;
  subject?: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}