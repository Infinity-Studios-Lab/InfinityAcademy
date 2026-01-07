import Calendar from '@/components/Calendar'
import { createClient } from "@/utils/supabase/server";
import redirectUser from "@/utils/roles/redirectUser";
import { getLessonsForStudent } from "@/lib/db/lessons";

export default async function StudentCalendarPage() {
  await redirectUser(["student"]);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const lessons = await getLessonsForStudent(user.id);

  // Format lessons for FullCalendar
  const events = lessons.map((lesson) => ({
    id: lesson.id,
    title: `${lesson.title} - ${lesson.tutor?.profile_data?.firstName || lesson.tutor?.email || "Tutor"}`,
    start: lesson.start_time,
    end: lesson.end_time,
    backgroundColor: lesson.status === "completed" ? "#10b981" : lesson.status === "cancelled" ? "#ef4444" : "#3b82f6",
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Calendar</h2>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <Calendar events={events} />
        </div>
      </div>
    </div>
  )
}
