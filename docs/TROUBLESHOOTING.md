# Troubleshooting Guide

## Signup Issues

### "Database error saving new user"

This error typically occurs when the database trigger fails. Here are solutions:

#### Option 1: Fix the Trigger (Recommended)

1. **Check if the trigger exists and is working:**

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check trigger function
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

2. **Ensure RLS allows inserts:**

```sql
-- Temporarily disable RLS to test
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Or add a policy that allows inserts
CREATE POLICY "Allow trigger inserts" ON public.users
  FOR INSERT WITH CHECK (true);
```

3. **Recreate the trigger with error handling:**

```sql
-- Drop and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, profile_data)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'profile_data', '{}'::jsonb)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error creating user record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Option 2: Disable Trigger and Handle in Application

If the trigger continues to cause issues, you can disable it and handle user creation in the application:

1. **Disable the trigger:**

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

2. **The application code will handle user creation** - it already tries to create the user record after signup and on email confirmation.

#### Option 3: Check Database Permissions

Ensure the function owner has proper permissions:

```sql
-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON public.users TO postgres;

-- Ensure the function owner is correct
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
```

## Login Issues

### "User role not found"

This happens when:

1. The user record doesn't exist in the `users` table
2. The role field is NULL

**Solution:**

1. Check if user exists:

```sql
SELECT * FROM public.users WHERE id = 'user-id-here';
```

2. If missing, create it:

```sql
INSERT INTO public.users (id, email, role, profile_data)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'role', 'student'),
  COALESCE(raw_user_meta_data->>'profile_data', '{}'::jsonb)
FROM auth.users
WHERE id = 'user-id-here'
ON CONFLICT (id) DO UPDATE SET role = COALESCE(users.role, EXCLUDED.role);
```

## Common Database Issues

### Table doesn't exist

Run the schema creation SQL from `DATABASE_SCHEMA.md`:

```sql
CREATE TABLE IF NOT EXISTS users (...);
```

### RLS blocking operations

Check RLS policies:

```sql
-- List all policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Temporarily disable RLS for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### Foreign key constraints

Ensure referenced tables exist:

```sql
-- Check if auth.users exists (it should, it's a Supabase system table)
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'auth'
  AND table_name = 'users'
);
```
