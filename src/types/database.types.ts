export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          password: string
          year: number | null
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          password: string
          year?: number | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          password?: string
          year?: number | null
        }
      }
      matiere: {
        Row: {
          nom: string
          departement: string
          annee: number
        }
        Insert: {
          nom: string
          departement: string
          annee: number
        }
        Update: {
          nom?: string
          departement?: string
          annee?: number
        }
      }
      student: {
        Row: {
          id: string
          user_id: string
          matieres: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          matieres?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          matieres?: string[] | null
        }
      }
      tutor: {
        Row: {
          id: string
          user_id: string
          matieres: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          matieres?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          matieres?: string[] | null
        }
      }
      admin: {
        Row: {
          id: string
          name: string | null
          email: string
          password: string
          created_at: string
          role: string
          permissions: string[] | null
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          password: string
          created_at?: string
          role?: string
          permissions?: string[] | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          password?: string
          created_at?: string
          role?: string
          permissions?: string[] | null
        }
      }
      session: {
        Row: {
          id: string
          eleve: string
          tuteur: string
          matiere_nom: string
          matiere_departement: string
          matiere_annee: number
          date: string
          duree: number
        }
        Insert: {
          id?: string
          eleve: string
          tuteur: string
          matiere_nom: string
          matiere_departement: string
          matiere_annee: number
          date: string
          duree: number
        }
        Update: {
          id?: string
          eleve?: string
          tuteur?: string
          matiere_nom?: string
          matiere_departement?: string
          matiere_annee?: number
          date?: string
          duree?: number
        }
      }
    }
  }
}