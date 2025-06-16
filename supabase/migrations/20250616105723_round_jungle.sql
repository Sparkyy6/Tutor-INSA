/*
  # Create users table for INSA Tutorat application

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `full_name` (text, not null)
      - `avatar_url` (text, nullable)
      - `year_level` (integer, not null, default 1)
      - `department` (text, not null)
      - `is_tutor` (boolean, not null, default false)
      - `bio` (text, nullable)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for users to insert their own data
    - Add policy for users to update their own data
    - Add policy for authenticated users to read other users' public data (for tutoring)

  3. Constraints
    - Foreign key constraint linking to auth.users
    - Unique constraint on email
    - Check constraint for valid year levels (1-5)
*/

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  year_level integer NOT NULL DEFAULT 1,
  department text NOT NULL,
  is_tutor boolean NOT NULL DEFAULT false,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Add check constraint for valid year levels
ALTER TABLE users ADD CONSTRAINT valid_year_level CHECK (year_level >= 1 AND year_level <= 5);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Authenticated users can read public profile data of other users (for tutoring purposes)
CREATE POLICY "Users can read public profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_is_tutor ON users(is_tutor);
CREATE INDEX IF NOT EXISTS idx_users_year_level ON users(year_level);