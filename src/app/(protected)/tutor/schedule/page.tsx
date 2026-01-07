"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { scheduleLesson } from "./actions";
import { useRouter, useSearchParams } from "next/navigation";

export default function TutorSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const message = searchParams.get("message");

  useEffect(() => {
    async function fetchMatchedStudents() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch tutor's matched students
      const { data: matches, error } = await supabase
        .from("tutor_student_matches")
        .select(`
          *,
          student:users!tutor_student_matches_student_id_fkey(id, email, profile_data)
        `)
        .eq("tutor_id", user.id);

      if (error) {
        console.error("Error fetching matches:", error);
        setStudents([]);
      } else {
        setStudents(matches?.map((m: any) => m.student).filter(Boolean) || []);
      }

      setLoading(false);
    }

    fetchMatchedStudents();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set("is_recurring", isRecurring.toString());
    
    try {
      await scheduleLesson(formData);
    } catch (error) {
      console.error("Error scheduling lesson:", error);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Schedule a Lesson</h1>

      {message && (
        <div className="alert alert-success mb-6">
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

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Student</span>
              </label>
              <select
                name="student_id"
                className="select select-bordered w-full"
                required
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.profile_data?.firstName && student.profile_data?.lastName
                      ? `${student.profile_data.firstName} ${student.profile_data.lastName}`
                      : student.email}
                  </option>
                ))}
              </select>
              {students.length === 0 && (
                <label className="label">
                  <span className="label-text-alt text-warning">
                    No students matched yet. Please contact an admin to get matched with students.
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Lesson Title</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Algebra Basics - Chapter 5"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Subject</span>
              </label>
              <input
                type="text"
                name="subject"
                placeholder="e.g., Mathematics"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Start Time</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">End Time</span>
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Description (Optional)</span>
              </label>
              <textarea
                name="description"
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="Add any additional details about the lesson..."
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text font-semibold">Recurring Lesson</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
              </label>
              <label className="label">
                <span className="label-text-alt">
                  If enabled, lessons will be created weekly at the same time until the end date.
                </span>
              </label>
            </div>

            {isRecurring && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Recur Until</span>
                </label>
                <input
                  type="date"
                  name="recurring_until"
                  className="input input-bordered w-full"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            )}

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || students.length === 0}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Scheduling...
                  </>
                ) : (
                  "Schedule Lesson"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

