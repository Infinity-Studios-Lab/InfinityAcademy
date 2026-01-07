import { createClient } from "@/utils/supabase/server";
import { TutorStudentMatch } from "@/types/database";

export async function getTutorMatches(tutorId: string): Promise<TutorStudentMatch[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tutor_student_matches')
    .select('*')
    .eq('tutor_id', tutorId);

  if (error) {
    console.error('Error fetching tutor matches:', error);
    return [];
  }

  // Fetch user data separately
  if (data && data.length > 0) {
    const studentIds = [...new Set(data.map(m => m.student_id))];
    const { data: students } = await supabase
      .from('users')
      .select('id, email, profile_data')
      .in('id', studentIds);

    return (data || []).map(match => ({
      ...match,
      student: students?.find(s => s.id === match.student_id),
    })) as TutorStudentMatch[];
  }

  return data || [];
}

export async function getStudentMatches(studentId: string): Promise<TutorStudentMatch[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tutor_student_matches')
    .select('*')
    .eq('student_id', studentId);

  if (error) {
    console.error('Error fetching student matches:', error);
    return [];
  }

  // Fetch user data separately
  if (data && data.length > 0) {
    const tutorIds = [...new Set(data.map(m => m.tutor_id))];
    const { data: tutors } = await supabase
      .from('users')
      .select('id, email, profile_data')
      .in('id', tutorIds);

    return (data || []).map(match => ({
      ...match,
      tutor: tutors?.find(t => t.id === match.tutor_id),
    })) as TutorStudentMatch[];
  }

  return data || [];
}

export async function getAllMatches(): Promise<TutorStudentMatch[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tutor_student_matches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  // Fetch user data separately
  if (data && data.length > 0) {
    const tutorIds = [...new Set(data.map(m => m.tutor_id))];
    const studentIds = [...new Set(data.map(m => m.student_id))];
    
    const { data: tutors } = await supabase
      .from('users')
      .select('id, email, profile_data')
      .in('id', tutorIds);
    
    const { data: students } = await supabase
      .from('users')
      .select('id, email, profile_data')
      .in('id', studentIds);

    return (data || []).map(match => ({
      ...match,
      tutor: tutors?.find(t => t.id === match.tutor_id),
      student: students?.find(s => s.id === match.student_id),
    })) as TutorStudentMatch[];
  }

  return data || [];
}

export async function createMatch(tutorId: string, studentId: string): Promise<TutorStudentMatch | null> {
  const supabase = await createClient();
  
  // Check if match already exists
  const { data: existing } = await supabase
    .from('tutor_student_matches')
    .select('id')
    .eq('tutor_id', tutorId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing) {
    return null; // Match already exists
  }

  const { data, error } = await supabase
    .from('tutor_student_matches')
    .insert([{ tutor_id: tutorId, student_id: studentId }])
    .select('*')
    .single();

  if (error) {
    console.error('Error creating match:', error);
    return null;
  }

  // Fetch user data
  const { data: tutor } = await supabase
    .from('users')
    .select('id, email, profile_data')
    .eq('id', tutorId)
    .single();
  
  const { data: student } = await supabase
    .from('users')
    .select('id, email, profile_data')
    .eq('id', studentId)
    .single();

  return {
    ...data,
    tutor: tutor || undefined,
    student: student || undefined,
  };
}

export async function deleteMatch(matchId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('tutor_student_matches')
    .delete()
    .eq('id', matchId);

  if (error) {
    console.error('Error deleting match:', error);
    return false;
  }

  return true;
}
