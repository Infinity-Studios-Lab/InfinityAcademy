import { createClient } from "@/utils/supabase/server";
import { TutorAvailability } from "@/types/database";

export async function getTutorAvailability(tutorId: string): Promise<TutorAvailability[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tutor_availability')
    .select('*')
    .eq('tutor_id', tutorId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching tutor availability:', error);
    return [];
  }

  return data || [];
}

export async function setTutorAvailability(tutorId: string, availability: {
  day_of_week: number;
  start_time: string;
  end_time: string;
}[]): Promise<boolean> {
  const supabase = await createClient();
  
  // Delete existing availability
  const { error: deleteError } = await supabase
    .from('tutor_availability')
    .delete()
    .eq('tutor_id', tutorId);

  if (deleteError) {
    console.error('Error deleting existing availability:', deleteError);
    // Continue anyway - might not exist yet
  }

  // Insert new availability if any
  if (availability.length > 0) {
    const availabilityData = availability.map(avail => ({
      tutor_id: tutorId,
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time,
    }));

    const { error: insertError } = await supabase
      .from('tutor_availability')
      .insert(availabilityData);

    if (insertError) {
      console.error('Error setting tutor availability:', insertError);
      return false;
    }
  }

  return true;
}

export async function getAvailableTutorsForDay(dayOfWeek: number, startTime: string, endTime: string): Promise<string[]> {
  const supabase = await createClient();
  
  // Get tutors available on this day with overlapping time slots
  const { data, error } = await supabase
    .from('tutor_availability')
    .select('tutor_id')
    .eq('day_of_week', dayOfWeek)
    .lte('start_time', startTime)
    .gte('end_time', endTime);

  if (error) {
    console.error('Error fetching available tutors:', error);
    return [];
  }

  return [...new Set((data || []).map(item => item.tutor_id))];
}

