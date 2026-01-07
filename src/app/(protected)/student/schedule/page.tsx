"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { scheduleLesson } from "./actions";
import { useRouter, useSearchParams } from "next/navigation";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function StudentSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tutors, setTutors] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Array<{ start: string; end: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const message = searchParams.get("message");

  useEffect(() => {
    async function fetchMatchedTutors() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch student's matched tutors
      const { data: matches, error: matchesError } = await supabase
        .from("tutor_student_matches")
        .select("tutor_id")
        .eq("student_id", user.id);

      if (matchesError || !matches || matches.length === 0) {
        setTutors([]);
      } else {
        const tutorIds = matches.map(m => m.tutor_id);
        const { data: tutorsData } = await supabase
          .from("users")
          .select("id, email, profile_data")
          .in("id", tutorIds)
          .eq("role", "tutor");
        
        setTutors(tutorsData || []);
      }

      setLoading(false);
    }

    fetchMatchedTutors();
  }, [router]);

  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedTutor || !selectedDay) {
        setAvailableSlots([]);
        return;
      }

      const supabase = createClient();
      const dayOfWeek = parseInt(selectedDay);
      
      const { data: availability, error } = await supabase
        .from("tutor_availability")
        .select("start_time, end_time")
        .eq("tutor_id", selectedTutor)
        .eq("day_of_week", dayOfWeek);

      if (error || !availability || availability.length === 0) {
        setAvailableSlots([]);
        return;
      }

      // Generate 1-hour slots within each availability range
      const oneHourSlots: Array<{ start: string; end: string }> = [];
      
      availability.forEach(av => {
        const startTime = av.start_time.split(':').map(Number); // [HH, mm, ss]
        const endTime = av.end_time.split(':').map(Number); // [HH, mm, ss]
        
        const startHour = startTime[0];
        const endHour = endTime[0];
        
        // Generate 1-hour slots from start to end
        for (let hour = startHour; hour < endHour; hour++) {
          const slotStart = `${hour.toString().padStart(2, '0')}:00:00`;
          const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
          oneHourSlots.push({ start: slotStart, end: slotEnd });
        }
      });
      
      setAvailableSlots(oneHourSlots);
    }

    fetchAvailability();
  }, [selectedTutor, selectedDay]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set("is_recurring", isRecurring.toString());
    formData.set("day_of_week", selectedDay); // Pass the selected day
    
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
                <span className="label-text font-semibold">Tutor</span>
              </label>
              <select
                name="tutor_id"
                className="select select-bordered w-full"
                value={selectedTutor}
                onChange={(e) => {
                  setSelectedTutor(e.target.value);
                  setSelectedDay("");
                }}
                required
              >
                <option value="">Select a tutor</option>
                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.profile_data?.firstName && tutor.profile_data?.lastName
                      ? `${tutor.profile_data.firstName} ${tutor.profile_data.lastName}`
                      : tutor.email}
                  </option>
                ))}
              </select>
              {tutors.length === 0 && (
                <label className="label">
                  <span className="label-text-alt text-warning">
                    No tutors matched yet. Please contact an admin to get matched with a tutor.
                  </span>
                </label>
              )}
            </div>

            {selectedTutor && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Day</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    required
                  >
                    <option value="">Select a day</option>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDay && availableSlots.length > 0 && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Available Time Slot</span>
                    </label>
                    <select
                      name="time_slot"
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="">Select a time slot</option>
                      {availableSlots.map((slot, index) => {
                        // Format time for display (HH:mm instead of HH:mm:ss)
                        const startTime = slot.start.substring(0, 5);
                        const endTime = slot.end.substring(0, 5);
                        return (
                          <option key={index} value={`${slot.start}-${slot.end}`}>
                            {startTime} - {endTime}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {selectedDay && availableSlots.length === 0 && (
                  <div className="alert alert-warning">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>This tutor is not available on {DAYS_OF_WEEK[parseInt(selectedDay)]}.</span>
                  </div>
                )}
              </>
            )}

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
                disabled={submitting || tutors.length === 0 || !selectedTutor || availableSlots.length === 0}
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

