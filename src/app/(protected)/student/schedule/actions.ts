"use server";

import { createClient } from "@/utils/supabase/server";
import { createLesson, createRecurringLessons } from "@/lib/db/lessons";
import { createGoogleMeetLink } from "@/lib/google-meet";
import { sendLessonReminder, generateReminderEmail } from "@/lib/email";
import { getUserById } from "@/lib/db/users";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function scheduleLesson(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const studentId = user.id;
  const tutorId = formData.get("tutor_id") as string;
  const subject = formData.get("subject") as string;
  const title = subject; // Use subject as title since title field is removed
  const selectedDay = parseInt(formData.get("day_of_week") as string);
  const timeSlot = formData.get("time_slot") as string;
  const description = formData.get("description") as string;
  const isRecurring = formData.get("is_recurring") === "true";
  const recurringUntil = formData.get("recurring_until") as string | null;

  // Calculate the next occurrence of the selected day of week
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  let daysUntilNext = selectedDay - currentDayOfWeek;
  
  // If the day is today or already passed this week, get next week's occurrence
  if (daysUntilNext < 0) {
    daysUntilNext += 7;
  } else if (daysUntilNext === 0) {
    // Check if the time slot has passed today
    const [startTimeStr] = timeSlot.split("-");
    const timeParts = startTimeStr.trim().split(":");
    const slotHour = parseInt(timeParts[0]);
    const slotMinute = parseInt(timeParts[1] || "0");
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // If the time slot has passed today, use next week
    if (currentHour > slotHour || (currentHour === slotHour && currentMinute >= slotMinute)) {
      daysUntilNext = 7;
    }
  }
  
  const lessonDate = new Date(today);
  lessonDate.setDate(today.getDate() + daysUntilNext);

  // Parse time slot (format: "HH:mm:ss-HH:mm:ss")
  const [startTimeStr, endTimeStr] = timeSlot.split("-");
  const lessonDateStr = lessonDate.toISOString().split("T")[0]; // YYYY-MM-DD
  const startTime = new Date(`${lessonDateStr}T${startTimeStr.trim()}`);
  const endTime = new Date(`${lessonDateStr}T${endTimeStr.trim()}`);

  // Create Google Meet link
  const googleMeetLink = await createGoogleMeetLink(title, startTime.toISOString(), endTime.toISOString());

  let lessons;
  if (isRecurring && recurringUntil) {
    lessons = await createRecurringLessons({
      tutor_id: tutorId,
      student_id: studentId,
      title,
      subject,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      description: description || undefined,
      recurring_until: recurringUntil,
      google_meet_link: googleMeetLink,
    });
  } else {
    const lesson = await createLesson({
      tutor_id: tutorId,
      student_id: studentId,
      title,
      subject,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      description: description || undefined,
      is_recurring: false,
      google_meet_link: googleMeetLink,
    });
    lessons = lesson ? [lesson] : [];
  }

  // Send email reminders
  if (lessons.length > 0) {
    const tutor = await getUserById(tutorId);
    const student = await getUserById(studentId);

    for (const lesson of lessons) {
      // Send reminder to student
      if (student) {
        const studentName = student.profile_data?.firstName || student.email;
        await sendLessonReminder({
          to: student.email,
          subject: `Lesson Reminder: ${title}`,
          html: generateReminderEmail(
            studentName,
            title,
            lesson.start_time,
            lesson.end_time,
            googleMeetLink,
            false
          ),
          lessonId: lesson.id,
        });
      }

      // Send reminder to tutor
      if (tutor) {
        const tutorName = tutor.profile_data?.firstName || tutor.email;
        await sendLessonReminder({
          to: tutor.email,
          subject: `Lesson Reminder: ${title}`,
          html: generateReminderEmail(
            tutorName,
            title,
            lesson.start_time,
            lesson.end_time,
            googleMeetLink,
            true
          ),
          lessonId: lesson.id,
        });
      }
    }
  }

  revalidatePath("/student/schedule");
  revalidatePath("/student/lessons");
  redirect("/student/lessons?message=Lesson scheduled successfully");
}
