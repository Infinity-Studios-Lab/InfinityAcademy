# Database Schema

This document describes the database schema required for the Infinity Academy scheduling system.

## Required Tables

### 1. users

User profiles table (extends Supabase auth.users).

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'tutor', 'parent', 'admin')),
  profile_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can view all users
-- Note: We check auth.jwt() instead of users table to avoid recursion
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role')::text = 'admin'
    OR EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND (au.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow inserts (for trigger and initial signup)
-- This allows the trigger function and application to create user records
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (true);
```

**Note:** The trigger function uses `SECURITY DEFINER` which runs with the privileges of the function owner (usually the postgres superuser), so it can bypass RLS. However, if you're still having issues, you may need to grant explicit permissions:

```sql
-- Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON public.users TO postgres;
```

### 2. tutor_student_matches

Stores the matching relationships between tutors and students (created by admins).

```sql
CREATE TABLE IF NOT EXISTS tutor_student_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tutor_id, student_id)
);

-- Enable RLS
ALTER TABLE tutor_student_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all matches
CREATE POLICY "Admins can view all matches" ON tutor_student_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Tutors can view their own matches
CREATE POLICY "Tutors can view their matches" ON tutor_student_matches
  FOR SELECT USING (tutor_id = auth.uid());

-- Policy: Students can view their own matches
CREATE POLICY "Students can view their matches" ON tutor_student_matches
  FOR SELECT USING (student_id = auth.uid());

-- Policy: Only admins can create matches
CREATE POLICY "Admins can create matches" ON tutor_student_matches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can delete matches
CREATE POLICY "Admins can delete matches" ON tutor_student_matches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### 3. tutor_availability

Stores tutor availability by day of week and time slots.

```sql
CREATE TABLE IF NOT EXISTS tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL, -- Format: HH:mm
  end_time TIME NOT NULL, -- Format: HH:mm
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Tutors can view their own availability
CREATE POLICY "Tutors can view own availability" ON tutor_availability
  FOR SELECT USING (tutor_id = auth.uid());

-- Policy: Students can view availability of their matched tutors
CREATE POLICY "Students can view matched tutor availability" ON tutor_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tutor_student_matches
      WHERE tutor_student_matches.tutor_id = tutor_availability.tutor_id
      AND tutor_student_matches.student_id = auth.uid()
    )
  );

-- Policy: Tutors can manage their own availability
CREATE POLICY "Tutors can manage own availability" ON tutor_availability
  FOR ALL USING (tutor_id = auth.uid());

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor_id ON tutor_availability(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_day ON tutor_availability(day_of_week);
```

### 4. lessons

Stores scheduled tutoring lessons with support for recurring lessons.

```sql
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  description TEXT,
  notes TEXT,
  google_meet_link TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_until TIMESTAMP WITH TIME ZONE,
  parent_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view lessons they're involved in
CREATE POLICY "Users can view their lessons" ON lessons
  FOR SELECT USING (tutor_id = auth.uid() OR student_id = auth.uid());

-- Policy: Students can create lessons with matched tutors
CREATE POLICY "Students can create lessons" ON lessons
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tutor_student_matches
      WHERE tutor_student_matches.tutor_id = lessons.tutor_id
      AND tutor_student_matches.student_id = lessons.student_id
    )
  );

-- Policy: Users can update lessons they're involved in
CREATE POLICY "Users can update their lessons" ON lessons
  FOR UPDATE USING (tutor_id = auth.uid() OR student_id = auth.uid());

-- Policy: Users can delete lessons they're involved in
CREATE POLICY "Users can delete their lessons" ON lessons
  FOR DELETE USING (tutor_id = auth.uid() OR student_id = auth.uid());

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_tutor_id ON lessons(tutor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_start_time ON lessons(start_time);
CREATE INDEX IF NOT EXISTS idx_lessons_parent_lesson_id ON lessons(parent_lesson_id);
```

## Setup Instructions

1. **Run the SQL migrations** in your Supabase SQL Editor in this order:

   - Create the `users` table (if not exists)
   - Create the `tutor_student_matches` table
   - Create the `tutor_availability` table
   - Create the `lessons` table
   - Set up all RLS policies
   - Create indexes

2. **Verify the setup**:
   - Test that tutors can set their availability
   - Test that students can only see availability of matched tutors
   - Test that students can schedule lessons with matched tutors
   - Test that admins can create matches

## Notes

- The `parent_lesson_id` field in the `lessons` table is used to link recurring lessons together
- The first lesson in a recurring series has itself as the `parent_lesson_id`
- Google Meet links are stored directly in the `google_meet_link` field
- Email reminders are handled by the application layer, not the database
- Tutor availability uses day_of_week (0-6) and TIME format for start/end times
- Students can only schedule lessons during tutor's available time slots
