"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function setTutorAvailabilityAction(availability: {
  day_of_week: number;
  start_time: string;
  end_time: string;
}[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Delete existing availability
  const { error: deleteError } = await supabase
    .from('tutor_availability')
    .delete()
    .eq('tutor_id', user.id);

  if (deleteError) {
    console.error('Error deleting existing availability:', deleteError);
    // Continue anyway - might not exist yet
  }

  // Insert new availability if any
  if (availability.length > 0) {
    const availabilityData = availability.map(avail => ({
      tutor_id: user.id,
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time,
    }));

    const { error: insertError } = await supabase
      .from('tutor_availability')
      .insert(availabilityData);

    if (insertError) {
      console.error('Error setting tutor availability:', insertError);
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath("/tutor/availability");
  return { success: true };
}

