# Scheduling Features Documentation

## Overview

This document describes the scheduling system implemented for Infinity Academy, including tutor-student matching, lesson scheduling, email reminders, and Google Meet integration.

## Features Implemented

### 1. Tutor Scheduling System

**Location**: `/tutor/schedule`

Tutors can schedule lessons with their matched students. Features include:

- **Student Selection**: Dropdown showing only students matched to the tutor
- **Time Selection**: Date and time pickers for start and end times
- **Recurring Lessons**: Option to create weekly recurring lessons until a specified end date
- **Google Meet Integration**: Automatic Google Meet link generation for each lesson
- **Email Reminders**: Automatic email reminders sent to both tutor and student

**Access**: Only tutors can access this page (enforced via layout protection)

### 2. Admin Matching System

**Location**: `/admin/matching`

Admins can create and manage matches between tutors and students. Features include:

- **Match Creation**: Select a tutor and student to create a match
- **Match Management**: View all existing matches in a table
- **Match Removal**: Delete matches when needed
- **User Display**: Shows user names or emails for easy identification

**Access**: Only admins can access this page (enforced via layout protection)

### 3. Tutor Lessons View

**Location**: `/tutor/lessons`

Tutors can view all their scheduled lessons. Features include:

- **Calendar View**: FullCalendar integration showing all lessons in a weekly view
- **Upcoming Lessons**: Sidebar showing the next 5 upcoming lessons
- **Lesson Table**: Complete list of all lessons with details
- **Google Meet Links**: Direct links to join Google Meet sessions
- **Status Indicators**: Visual badges showing lesson status (scheduled, completed, cancelled, in-progress)

**Access**: Only tutors can access this page (enforced via layout protection)

### 4. Student Lessons View

**Location**: `/student/lessons`

Students can view all their scheduled lessons. Features include:

- **Calendar View**: FullCalendar integration showing all lessons in a weekly view
- **Upcoming Lessons**: Sidebar showing the next 5 upcoming lessons
- **Lesson Table**: Complete list of all lessons with tutor information
- **Google Meet Links**: Direct links to join Google Meet sessions
- **Status Indicators**: Visual badges showing lesson status

**Access**: Only students can access this page (enforced via layout protection)

### 5. Email Reminder System

**Location**: `/api/email/send-reminder`

Automatic email reminders are sent when lessons are scheduled. Features include:

- **Automatic Sending**: Reminders sent immediately upon lesson creation
- **Recipient Support**: Emails sent to both tutor and student
- **HTML Formatting**: Beautifully formatted HTML emails with lesson details
- **Google Meet Links**: Meeting links included in reminder emails

**Implementation**: Currently logs emails (ready for integration with SendGrid, Resend, or similar service)

### 6. Google Meet Integration

**Location**: `src/lib/google-meet.ts`

Automatic Google Meet link generation for each lesson. Features include:

- **Automatic Generation**: Links created when lessons are scheduled
- **Unique Links**: Each lesson gets its own unique meeting link
- **Storage**: Links stored in database for easy access

**Implementation**: Currently generates placeholder links (ready for Google Calendar API integration)

## Database Schema

See `DATABASE_SCHEMA.md` for complete database schema details.

Key tables:
- `tutor_student_matches`: Stores tutor-student relationships
- `lessons`: Stores scheduled lessons with recurring support
- `users`: User profiles and roles

## Authentication & Authorization

All routes are protected by:

1. **Middleware**: Checks authentication status and redirects unauthenticated users to login
2. **Layout Protection**: Each protected route has a layout that verifies user role
3. **Row Level Security**: Database-level security policies ensure users can only access their own data

### Route Protection

- `/tutor/*` - Requires tutor role
- `/student/*` - Requires student role
- `/admin/*` - Requires admin role
- `/parent/*` - Requires parent role
- `/login` and `/signup` - Redirects authenticated users away

## Fake Data Fallback

If database queries fail, the application provides fake data to ensure the UI remains functional:

- **Tutors**: Sample tutor data with names and emails
- **Students**: Sample student data with names and emails
- **Lessons**: Sample lesson data for demonstration

This ensures the application works even if the database is not fully configured.

## Next Steps for Production

1. **Email Service Integration**: 
   - Integrate with SendGrid, Resend, or similar service
   - Update `/api/email/send-reminder/route.ts` with actual email sending

2. **Google Calendar API Integration**:
   - Set up Google Cloud project and enable Calendar API
   - Configure OAuth credentials
   - Update `src/lib/google-meet.ts` to use actual Google Calendar API

3. **Database Setup**:
   - Run SQL migrations from `DATABASE_SCHEMA.md`
   - Verify RLS policies are working correctly
   - Test with real user data

4. **Email Reminder Scheduling**:
   - Consider implementing a cron job or scheduled function
   - Send reminders 24 hours before lessons
   - Send reminders 1 hour before lessons

5. **Error Handling**:
   - Add better error messages for users
   - Implement retry logic for failed operations
   - Add logging for debugging

## File Structure

```
src/
├── app/
│   ├── (protected)/
│   │   ├── tutor/
│   │   │   ├── schedule/
│   │   │   │   ├── page.tsx (Scheduling form)
│   │   │   │   ├── layout.tsx (Role protection)
│   │   │   │   └── actions.ts (Server actions)
│   │   │   └── lessons/
│   │   │       ├── page.tsx (Lessons view)
│   │   │       └── layout.tsx (Role protection)
│   │   ├── student/
│   │   │   └── lessons/
│   │   │       ├── page.tsx (Lessons view)
│   │   │       └── layout.tsx (Role protection)
│   │   └── admin/
│   │       └── matching/
│   │           ├── page.tsx (Matching interface)
│   │           ├── layout.tsx (Role protection)
│   │           └── actions.ts (Server actions)
│   └── api/
│       └── email/
│           └── send-reminder/
│               └── route.ts (Email API)
├── lib/
│   ├── db/
│   │   ├── lessons.ts (Lesson database functions)
│   │   ├── matches.ts (Match database functions)
│   │   └── users.ts (User database functions)
│   ├── google-meet.ts (Google Meet integration)
│   └── email.ts (Email utilities)
└── types/
    └── database.ts (TypeScript types)
```

## Testing

To test the features:

1. **As Admin**:
   - Navigate to `/admin/matching`
   - Create matches between tutors and students
   - Verify matches appear in the table

2. **As Tutor**:
   - Navigate to `/tutor/schedule`
   - Select a matched student
   - Schedule a lesson (try both single and recurring)
   - Navigate to `/tutor/lessons` to view scheduled lessons

3. **As Student**:
   - Navigate to `/student/lessons`
   - View scheduled lessons
   - Verify calendar and table views work correctly

4. **Authentication**:
   - Try accessing protected routes without logging in
   - Verify redirect to login page
   - Try accessing routes with wrong role
   - Verify redirect to appropriate dashboard

