"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { setTutorAvailabilityAction } from "./actions";
import { useRouter } from "next/navigation";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function TutorAvailabilityPage() {
  const router = useRouter();
  const [availability, setAvailability] = useState<Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchAvailability() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("tutor_availability")
        .select("*")
        .eq("tutor_id", user.id);

      if (!error && data) {
        setAvailability(data.map(av => ({
          day_of_week: av.day_of_week,
          start_time: av.start_time,
          end_time: av.end_time,
        })));
      }

      setLoading(false);
    }

    fetchAvailability();
  }, [router]);

  function addTimeSlot() {
    setAvailability([...availability, { day_of_week: 1, start_time: "09:00", end_time: "17:00" }]);
  }

  function removeTimeSlot(index: number) {
    setAvailability(availability.filter((_, i) => i !== index));
  }

  function updateTimeSlot(index: number, field: string, value: any) {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  }

  async function handleSave() {
    setSaving(true);

    const result = await setTutorAvailabilityAction(availability);
    
    if (result.success) {
      router.push("/tutor?message=Availability updated successfully");
    } else {
      alert(`Failed to save availability: ${result.error || "Unknown error"}`);
    }
    
    setSaving(false);
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
      <h1 className="text-3xl font-bold mb-6">Set Your Availability</h1>
      <p className="text-base-content/70 mb-6">
        Set the days and times you're available for tutoring. Students will only be able to schedule lessons during these times.
      </p>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {availability.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base-content/70 mb-4">No availability set yet.</p>
              <button onClick={addTimeSlot} className="btn btn-primary">
                Add Time Slot
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {availability.map((slot, index) => (
                <div key={index} className="card bg-base-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Day</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={slot.day_of_week}
                        onChange={(e) => updateTimeSlot(index, "day_of_week", parseInt(e.target.value))}
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Start Time</span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered w-full"
                        value={slot.start_time}
                        onChange={(e) => updateTimeSlot(index, "start_time", e.target.value)}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">End Time</span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered w-full"
                        value={slot.end_time}
                        onChange={(e) => updateTimeSlot(index, "end_time", e.target.value)}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">&nbsp;</span>
                      </label>
                      <button
                        onClick={() => removeTimeSlot(index)}
                        className="btn btn-error"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={addTimeSlot} className="btn btn-outline w-full">
                + Add Another Time Slot
              </button>
            </div>
          )}

          <div className="form-control mt-6">
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                "Save Availability"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

