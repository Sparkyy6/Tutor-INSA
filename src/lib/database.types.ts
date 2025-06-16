export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string
          profile_picture_url: string | null
          department: string | null
          is_tutor: boolean
          role: 'student' | 'tutor' | 'admin'
          campus_id: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          full_name: string
          profile_picture_url?: string | null
          department?: string | null
          is_tutor?: boolean
          role?: 'student' | 'tutor' | 'admin'
          campus_id?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          profile_picture_url?: string | null
          department?: string | null
          is_tutor?: boolean
          role?: 'student' | 'tutor' | 'admin'
          campus_id?: number | null
        }
      }
      subjects: {
        Row: {
          id: number
          name: string
          code: string
          description: string | null
          department: string
          year_level: string
          credits: number
          level: 'L1' | 'L2' | 'L3' | 'M1' | 'M2' | null
        }
        Insert: {
          id?: number
          name: string
          code: string
          description?: string | null
          department: string
          year_level: string
          credits: number
          level?: 'L1' | 'L2' | 'L3' | 'M1' | 'M2' | null
        }
        Update: {
          id?: number
          name?: string
          code?: string
          description?: string | null
          department?: string
          year_level?: string
          credits?: number
          level?: 'L1' | 'L2' | 'L3' | 'M1' | 'M2' | null
        }
      }
      campuses: {
        Row: {
          id: number
          name: string
          city: string
          address: string | null
        }
        Insert: {
          id?: number
          name: string
          city: string
          address?: string | null
        }
        Update: {
          id?: number
          name?: string
          city?: string
          address?: string | null
        }
      }
      tutoring_sessions: {
        Row: {
          id: number
          title: string
          tutor_id: string
          student_id: string
          subject_id: number
          scheduled_at: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          tutor_id: string
          student_id: string
          subject_id: number
          scheduled_at: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          tutor_id?: string
          student_id?: string
          subject_id?: number
          scheduled_at?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}