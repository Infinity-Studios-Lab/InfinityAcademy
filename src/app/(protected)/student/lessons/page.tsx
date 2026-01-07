import { createClient } from "@/utils/supabase/server";
import redirectUser from "@/utils/roles/redirectUser";
import { getLessonsForStudent } from "@/lib/db/lessons";
import Calendar from "@/components/Calendar";
import Link from "next/link";

export default async function StudentLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  await redirectUser(["student"]);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const lessons = await getLessonsForStudent(user.id);

  const { message } = await searchParams;

  // Format lessons for FullCalendar
  const calendarEvents = lessons.map((lesson) => ({
    id: lesson.id,
    title: `${lesson.title} - ${lesson.tutor?.profile_data?.firstName || lesson.tutor?.email || "Tutor"}`,
    start: lesson.start_time,
    end: lesson.end_time,
    backgroundColor: lesson.status === "completed" ? "#10b981" : lesson.status === "cancelled" ? "#ef4444" : "#3b82f6",
  }));

  const upcomingLessons = lessons
    .filter((lesson) => new Date(lesson.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Lessons</h1>
      </div>

      {message && (
        <div className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Calendar View</h2>
              <Calendar events={calendarEvents} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Upcoming Lessons</h2>
              {upcomingLessons.length === 0 ? (
                <p className="text-base-content/70">No upcoming lessons scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingLessons.map((lesson) => {
                    const startDate = new Date(lesson.start_time);
                    const endDate = new Date(lesson.end_time);
                    return (
                      <div key={lesson.id} className="border-l-4 border-primary pl-4">
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <p className="text-sm text-base-content/70">
                          with {lesson.tutor?.profile_data?.firstName || lesson.tutor?.email}
                        </p>
                        <p className="text-sm text-base-content/70">
                          {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {lesson.google_meet_link && (
                          <a
                            href={lesson.google_meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm link link-primary mt-2 inline-block"
                          >
                            Join Google Meet
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">All Lessons</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Tutor</th>
                  <th>Subject</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Meeting Link</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => {
                  const startDate = new Date(lesson.start_time);
                  const endDate = new Date(lesson.end_time);
                  return (
                    <tr key={lesson.id}>
                      <td>{lesson.title}</td>
                      <td>
                        {lesson.tutor?.profile_data?.firstName && lesson.tutor?.profile_data?.lastName
                          ? `${lesson.tutor.profile_data.firstName} ${lesson.tutor.profile_data.lastName}`
                          : lesson.tutor?.email || "Unknown"}
                      </td>
                      <td>{lesson.subject}</td>
                      <td>
                        {startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - {endDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            lesson.status === "completed"
                              ? "badge-success"
                              : lesson.status === "cancelled"
                              ? "badge-error"
                              : lesson.status === "in-progress"
                              ? "badge-warning"
                              : "badge-info"
                          }`}
                        >
                          {lesson.status}
                        </span>
                      </td>
                      <td>
                        {lesson.google_meet_link ? (
                          <a
                            href={lesson.google_meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                          >
                            Join
                          </a>
                        ) : (
                          <span className="text-base-content/50">No link</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

