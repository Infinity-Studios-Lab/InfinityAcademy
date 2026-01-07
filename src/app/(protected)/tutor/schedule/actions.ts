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

  const tutorId = user.id;
  const studentId = formData.get("student_id") as string;
  const title = formData.get("title") as string;
  const subject = formData.get("subject") as string;
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;
  const description = formData.get("description") as string;
  const isRecurring = formData.get("is_recurring") === "true";
  const recurringUntil = formData.get("recurring_until") as string | null;

  // Create Google Meet link
  const googleMeetLink = await createGoogleMeetLink(title, startTime, endTime);

  let lessons;
  if (isRecurring && recurringUntil) {
    lessons = await createRecurringLessons({
      tutor_id: tutorId,
      student_id: studentId,
      title,
      subject,
      start_time: startTime,
      end_time: endTime,
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
      start_time: startTime,
      end_time: endTime,
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

  revalidatePath("/tutor/schedule");
  revalidatePath("/tutor/lessons");
  redirect("/tutor/lessons?message=Lesson scheduled successfully");
}

