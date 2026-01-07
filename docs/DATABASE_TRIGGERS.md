# Database Triggers

This document describes database triggers that should be set up in Supabase to automatically handle user creation.

## Automatic User Record Creation

When a user signs up through Supabase Auth, we need to automatically create a corresponding record in the `users` table. This can be done with a database trigger.

### Trigger Function

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table, bypassing RLS since this is a trigger
  INSERT INTO public.users (id, email, role, profile_data)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'), -- Default to student if no role specified
    COALESCE(NEW.raw_user_meta_data->>'profile_data', '{}'::jsonb)
  )
  ON CONFLICT (id) DO NOTHING; -- Don't fail if user already exists
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Error creating user record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists (to avoid errors on re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Alternative: Update User Metadata During Signup

If you prefer to set the role during signup (which we do in the application), you can pass it in the user metadata:

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: "student", // or 'tutor', 'parent'
    },
  },
});
```

Then the trigger will pick it up from `raw_user_meta_data`.

### Update Existing Users

If you have existing auth users without corresponding `users` records, you can create them with:

```sql
-- Insert missing users from auth.users
INSERT INTO public.users (id, email, role, profile_data)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'role', 'student'),
  COALESCE(raw_user_meta_data->>'profile_data', '{}'::jsonb)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

## Setup Instructions

1. **Run the trigger function** in your Supabase SQL Editor
2. **Test** by creating a new user - the `users` record should be created automatically
3. **Verify** that the trigger works by checking the `users` table after signup

## Notes

- The trigger uses `SECURITY DEFINER` to ensure it has permission to insert into the `users` table
- The role defaults to 'student' if not specified in metadata
- The trigger fires AFTER INSERT on auth.users, so the auth user must be created first
