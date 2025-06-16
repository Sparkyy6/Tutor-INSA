/*
  # Fix users table INSERT policy

  1. Security Policy Update
    - Drop the existing INSERT policy that uses `uid()` 
    - Create a new INSERT policy using `auth.uid()` which is the correct function in Supabase
    - This allows authenticated users to insert their own profile data during signup

  2. Policy Details
    - Policy name: "Users can insert own data"
    - Allows INSERT operations where the user's auth ID matches the record ID
    - Essential for user registration flow to work properly
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create the corrected INSERT policy using auth.uid()
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);