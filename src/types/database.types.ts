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
          created_at: string
          role: 'student' | 'tutor' | 'admin'
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          password: string
          created_at?: string
          role?: 'student' | 'tutor' | 'admin'
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          password?: string
          created_at?: string
          role?: 'student' | 'tutor' | 'admin'
        }
      }
      student: {
        Row: {
          id: string
          name: string | null
          email: string
          password: string
          created_at: string
          role: 'student'
          enrolledcourses: string[] | null
          year: number | null
          department: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          password: string
          created_at?: string
          role?: 'student'
          enrolledcourses?: string[] | null
          year?: number | null
          department?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          password?: string
          created_at?: string
          role?: 'student'
          enrolledcourses?: string[] | null
          year?: number | null
          department?: string | null
        }
      }
      tutor: {
        Row: {
          id: string
          name: string | null
          email: string
          password: string
          created_at: string
          role: 'tutor'
          subject: string[] | null
          department: string | null
          availablehours: string[] | null
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          password: string
          created_at?: string
          role?: 'tutor'
          subject?: string[] | null
          department?: string | null
          availablehours?: string[] | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          password?: string
          created_at?: string
          role?: 'tutor'
          subject?: string[] | null
          department?: string | null
          availablehours?: string[] | null
        }
      }
      admin: {
        Row: {
          id: string
          name: string | null
          email: string
          password: string
          created_at: string
          role: 'admin'
          permissions: string[] | null
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          password: string
          created_at?: string
          role?: 'admin'
          permissions?: string[] | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          password?: string
          created_at?: string
          role?: 'admin'
          permissions?: string[] | null
        }
      }
      session: {
        Row: {
          id: string
          subject: string
          scheduled_at: string
          duration: string | null
          status: 'scheduled' | 'completed' | 'cancelled'
          created_at: string
          student_id: string
          tutor_id: string
        }
        Insert: {
          id?: string
          subject: string
          scheduled_at: string
          duration?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          student_id: string
          tutor_id: string
        }
        Update: {
          id?: string
          subject?: string
          scheduled_at?: string
          duration?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          student_id?: string
          tutor_id?: string
        }
      }
    }
  }
}