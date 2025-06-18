export interface users {
  id: string;
  name: string;
  email: string;
  year: number;
  departement: string;
  preorientation?: string; // Uniquement pour les 2A (year=2)
}


export interface student extends users  {
  student_id?: string;
  user_id : string;
  matiere: string[];
}

export interface Tutor extends users {
  tutor_id?: string;
  user_id: string;
  matiere: string[];
}


export interface Admin{
  permissions: string[]; // List of admin permissions
}


export interface session {
  eleve_id : number;
  tuteur_id : number;
  matiere_nom: string;
  matiere_departement: string; // Department of the subject
  matiere_annee : number;
  duration: number; // Duration of the session in minutes
  date: string; // Date of the session
}


export interface matiere {
  nom : string; // Name of the subject
  departement: string; // Department of the subject
  annee: number; // Year of the subject
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string | null;
  created_at: string;
}