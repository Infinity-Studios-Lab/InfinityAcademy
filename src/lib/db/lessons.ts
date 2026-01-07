import { createClient } from "@/utils/supabase/server";
import { Lesson } from "@/types/database";

export async function getLessonsForTutor(tutorId: string): Promise<Lesson[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('tutor_id', tutorId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching tutor lessons:', error);
    return [];
  }

  // Fetch user data separately if needed
  if (data && data.length > 0) {
    const studentIds = [...new Set(data.map(l => l.student_id))];
    const { data: students } = await supabase
      .from('users')
      .select('id, email, profile_data')
      .in('id', studentIds);

    return (data || []).map(lesson => ({
      ...lesson,
      student: students?.find(s => s.id === lesson.student_id),
    })) as Lesson[];
  }

  return data || [];
}

export async function getLessonsForStudent(studentId: string): Promise<Lesson[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('student_id', studentId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching student lessons:', error);
    return [];
  }

  // Fetch user data separately if needed
  if (data && data.length > 0) {
    const tutorIds = [...new Set(data.map(l => l.tutor_id))];
    const { data: tutors } = await supabase
      .from('users')
      .select('id, email, profile_data')
      .in('id', tutorIds);

    return (data || []).map(lesson => ({
      ...lesson,
      tutor: tutors?.find(t => t.id === lesson.tutor_id),
    })) as Lesson[];
  }

  return data || [];
}

export async function createLesson(lesson: {
  tutor_id: string;
  student_id: string;
  title: string;
  subject: string;
  start_time: string;
  end_time: string;
  description?: string;
  is_recurring: boolean;
  recurring_until?: string;
  google_meet_link?: string;
}): Promise<Lesson | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .insert([lesson])
    .select()
    .single();

  if (error) {
    console.error('Error creating lesson:', error);
    return null;
  }

  return data;
}

export async function createRecurringLessons(lesson: {
  tutor_id: string;
  student_id: string;
  title: string;
  subject: string;
  start_time: string;
  end_time: string;
  description?: string;
  recurring_until: string;
  google_meet_link?: string;
}): Promise<Lesson[]> {
  const supabase = await createClient();
  const lessons: Lesson[] = [];
  const startDate = new Date(lesson.start_time);
  const endDate = new Date(lesson.recurring_until);
  const endTime = new Date(lesson.end_time);
  const duration = endTime.getTime() - startDate.getTime();

  let currentDate = new Date(startDate);
  let parentLessonId: string | undefined;

  while (currentDate <= endDate) {
    const lessonStart = new Date(currentDate);
    const lessonEnd = new Date(lessonStart.getTime() + duration);

    const lessonData: any = {
      tutor_id: lesson.tutor_id,
      student_id: lesson.student_id,
      title: lesson.title,
      subject: lesson.subject,
      start_time: lessonStart.toISOString(),
      end_time: lessonEnd.toISOString(),
      description: lesson.description,
      is_recurring: true,
      google_meet_link: lesson.google_meet_link,
    };

    if (parentLessonId) {
      lessonData.parent_lesson_id = parentLessonId;
    }

    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single();

    if (error) {
      console.error('Error creating recurring lesson:', error);
    } else if (data) {
      if (!parentLessonId) {
        parentLessonId = data.id;
        // Update the first lesson to have itself as parent
        await updateLesson(data.id, { parent_lesson_id: parentLessonId });
      }
      lessons.push(data);
    }

    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return lessons;
}

export async function updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId);

  if (error) {
    console.error('Error updating lesson:', error);
    return false;
  }

  return true;
}

