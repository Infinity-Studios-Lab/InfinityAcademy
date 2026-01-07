"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { createTutorStudentMatch, removeTutorStudentMatch } from "./actions";
import { useRouter } from "next/navigation";

export default function AdminMatchingPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      const supabase = createClient();
      
      // Verify user is authenticated and is admin
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError("You must be logged in to access this page.");
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (userError || !userRecord || userRecord.role !== "admin") {
        setError("Access denied. You must be an administrator to access this page.");
        setLoading(false);
        return;
      }
      
      // Fetch tutors
      const { data: tutorsData, error: tutorsError } = await supabase
        .from("users")
        .select("*")
        .eq("role", "tutor");

      if (tutorsError) {
        const errorMsg = tutorsError.message || JSON.stringify(tutorsError);
        console.error("Error fetching tutors:", {
          message: tutorsError.message,
          details: tutorsError.details,
          hint: tutorsError.hint,
          code: tutorsError.code,
          fullError: tutorsError
        });
        
        // Check for RLS/permissions issues
        if (tutorsError.code === 'PGRST301' || tutorsError.message?.includes('permission denied') || tutorsError.message?.includes('row-level security')) {
          setError("Permission denied. Please ensure you have admin access and the RLS policies are configured correctly.");
        } else {
          setError(`Failed to load tutors: ${errorMsg}`);
        }
        setTutors([]);
      } else {
        setTutors(tutorsData || []);
      }

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from("users")
        .select("*")
        .eq("role", "student");

      if (studentsError) {
        const errorMsg = studentsError.message || JSON.stringify(studentsError);
        console.error("Error fetching students:", {
          message: studentsError.message,
          details: studentsError.details,
          hint: studentsError.hint,
          code: studentsError.code,
          fullError: studentsError
        });
        
        if (studentsError.code === 'PGRST301' || studentsError.message?.includes('permission denied') || studentsError.message?.includes('row-level security')) {
          setError("Permission denied. Please ensure you have admin access and the RLS policies are configured correctly.");
        } else if (!error) {
          setError(`Failed to load students: ${errorMsg}`);
        }
        setStudents([]);
      } else {
        setStudents(studentsData || []);
      }

      // Fetch existing matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("tutor_student_matches")
        .select("*")
        .order("created_at", { ascending: false });

      if (matchesError) {
        const errorMsg = matchesError.message || JSON.stringify(matchesError);
        console.error("Error fetching matches:", {
          message: matchesError.message,
          details: matchesError.details,
          hint: matchesError.hint,
          code: matchesError.code,
          fullError: matchesError
        });
        
        setError(`Failed to load matches: ${errorMsg}`);
        setMatches([]);
      } else if (matchesData && matchesData.length > 0) {
        // Fetch user data separately
        const tutorIds = [...new Set(matchesData.map(m => m.tutor_id))];
        const studentIds = [...new Set(matchesData.map(m => m.student_id))];
        
        const { data: tutors } = await supabase
          .from("users")
          .select("id, email, profile_data")
          .in("id", tutorIds);
        
        const { data: students } = await supabase
          .from("users")
          .select("id, email, profile_data")
          .in("id", studentIds);

        // Combine match data with user data
        const matchesWithUsers = matchesData.map(match => ({
          ...match,
          tutor: tutors?.find(t => t.id === match.tutor_id),
          student: students?.find(s => s.id === match.student_id),
        }));
        
        setMatches(matchesWithUsers);
      } else {
        setMatches([]);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  async function handleCreateMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTutor || !selectedStudent) {
      alert("Please select both a tutor and a student");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.set("tutor_id", selectedTutor);
    formData.set("student_id", selectedStudent);

    const result = await createTutorStudentMatch(formData);

    if (result.error) {
      alert(result.error);
    } else {
      // Refresh matches
      const supabase = createClient();
      const { data: matchesData } = await supabase
        .from("tutor_student_matches")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (matchesData && matchesData.length > 0) {
        // Fetch user data separately
        const tutorIds = [...new Set(matchesData.map(m => m.tutor_id))];
        const studentIds = [...new Set(matchesData.map(m => m.student_id))];
        
        const { data: tutors } = await supabase
          .from("users")
          .select("id, email, profile_data")
          .in("id", tutorIds);
        
        const { data: students } = await supabase
          .from("users")
          .select("id, email, profile_data")
          .in("id", studentIds);

        // Combine match data with user data
        const matchesWithUsers = matchesData.map(match => ({
          ...match,
          tutor: tutors?.find(t => t.id === match.tutor_id),
          student: students?.find(s => s.id === match.student_id),
        }));
        
        setMatches(matchesWithUsers);
      } else {
        setMatches([]);
      }
      
      setSelectedTutor("");
      setSelectedStudent("");
      router.refresh();
    }

    setSubmitting(false);
  }

  async function handleRemoveMatch(matchId: string) {
    if (!confirm("Are you sure you want to remove this match?")) {
      return;
    }

    const formData = new FormData();
    formData.set("match_id", matchId);

    const result = await removeTutorStudentMatch(formData);

    if (result.error) {
      alert(result.error);
    } else {
      // Refresh matches
      const supabase = createClient();
      const { data: matchesData } = await supabase
        .from("tutor_student_matches")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (matchesData && matchesData.length > 0) {
        // Fetch user data separately
        const tutorIds = [...new Set(matchesData.map(m => m.tutor_id))];
        const studentIds = [...new Set(matchesData.map(m => m.student_id))];
        
        const { data: tutors } = await supabase
          .from("users")
          .select("id, email, profile_data")
          .in("id", tutorIds);
        
        const { data: students } = await supabase
          .from("users")
          .select("id, email, profile_data")
          .in("id", studentIds);

        // Combine match data with user data
        const matchesWithUsers = matchesData.map(match => ({
          ...match,
          tutor: tutors?.find(t => t.id === match.tutor_id),
          student: students?.find(s => s.id === match.student_id),
        }));
        
        setMatches(matchesWithUsers);
      } else {
        setMatches([]);
      }
      
      router.refresh();
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Match Students with Tutors</h1>

      {error && (
        <div className="alert alert-error">
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
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Error loading data</h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Create New Match</h2>
          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Tutor</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedTutor}
                  onChange={(e) => setSelectedTutor(e.target.value)}
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
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Student</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
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
              </div>
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating Match...
                  </>
                ) : (
                  "Create Match"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Existing Matches</h2>
          {matches.length === 0 ? (
            <p className="text-base-content/70">No matches found. Create a match above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Tutor</th>
                    <th>Student</th>
                    <th>Matched On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id}>
                      <td>
                        {match.tutor?.profile_data?.firstName && match.tutor?.profile_data?.lastName
                          ? `${match.tutor.profile_data.firstName} ${match.tutor.profile_data.lastName}`
                          : match.tutor?.email || "Unknown"}
                      </td>
                      <td>
                        {match.student?.profile_data?.firstName && match.student?.profile_data?.lastName
                          ? `${match.student.profile_data.firstName} ${match.student.profile_data.lastName}`
                          : match.student?.email || "Unknown"}
                      </td>
                      <td>
                        {new Date(match.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleRemoveMatch(match.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

