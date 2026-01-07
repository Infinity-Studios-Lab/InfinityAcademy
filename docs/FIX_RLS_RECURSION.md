# Fix RLS Infinite Recursion Issue

## Problem

The error "infinite recursion detected in policy for relation 'users'" occurs when an RLS policy on the `users` table queries the `users` table itself, creating a circular dependency.

## Solution

### Step 1: Drop the problematic policy

```sql
DROP POLICY IF EXISTS "Admins can view all users" ON users;
```

### Step 2: Create a fixed policy that doesn't cause recursion

```sql
-- Fixed policy: Admins can view all users
-- Uses auth.jwt() or auth.users instead of querying users table
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role')::text = 'admin'
    OR EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND (au.raw_user_meta_data->>'role')::text = 'admin'
    )
  );
```

### Step 3: Alternative - Simpler approach (if above doesn't work)

If the JWT approach doesn't work, you can use a service role key for admin operations or disable RLS for admin operations:

```sql
-- Option A: Allow service role to bypass (if using service role)
-- This is handled automatically by SECURITY DEFINER functions

-- Option B: Create a simpler policy that checks auth.users directly
DROP POLICY IF EXISTS "Admins can view all users" ON users;

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );
```

### Step 4: Ensure INSERT policy exists

```sql
-- Make sure this policy exists (allows inserts)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (true);
```

## Complete Fix Script

Run this complete script to fix all RLS issues:

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Enable insert for trigger function" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- Recreate fixed policies
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (true);
```

## Verify

After running the fix, test by:
1. Creating a new user account
2. Confirming the email
3. Checking that the user record exists in the `users` table with the correct role

```sql
-- Check if user was created
SELECT id, email, role FROM users ORDER BY created_at DESC LIMIT 5;
```

