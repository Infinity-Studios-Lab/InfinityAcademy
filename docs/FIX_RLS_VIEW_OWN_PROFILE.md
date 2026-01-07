# Fix RLS Policy for Viewing Own Profile

## Problem

Users can't see their own records in the `users` table due to RLS policy issues. The error shows "User record not found in database" even though the record exists.

## Solution

The "Users can view own profile" policy needs to work correctly. Run this SQL to fix it:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Recreate with explicit check
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);
```

## Verify the Policy Works

Test the policy:

```sql
-- As the authenticated user, this should return your record
SELECT * FROM users WHERE id = auth.uid();
```

## Alternative: Temporarily Disable RLS for Testing

If you need to test without RLS:

```sql
-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Test your queries

-- Re-enable RLS when done
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## Complete Policy Setup

Here's the complete set of policies that should exist:

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all users (fixed to avoid recursion)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow inserts (for trigger and application)
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT
  WITH CHECK (true);
```

## Debugging

If policies still don't work, check:

1. **RLS is enabled:**

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';
```

2. **Policies exist:**

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

3. **Current user context:**

```sql
SELECT auth.uid(), auth.email();
```

4. **Test query with service role (bypasses RLS):**
   Use the Supabase service role key in your application temporarily to test if it's an RLS issue.
