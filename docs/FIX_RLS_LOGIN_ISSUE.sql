-- Fix RLS Policies for User Login Issue
-- Run this in your Supabase SQL Editor

-- Step 1: Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert for trigger function" ON users;

-- Step 2: Recreate policies correctly

-- Policy 1: Users can view their own profile
-- This MUST work for login to succeed
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy 2: Admins can view all users (fixed to avoid recursion)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow inserts (for trigger and application)
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT 
  WITH CHECK (true);

-- Step 3: Verify RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 4: Test the policy (run this as your user)
-- SELECT * FROM users WHERE id = auth.uid();

-- If the test query above doesn't work, temporarily disable RLS to verify the data exists:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- SELECT * FROM users; -- Check if your user exists
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

