"use server";

import { createMatch, deleteMatch } from "@/lib/db/matches";
import { revalidatePath } from "next/cache";

export async function createTutorStudentMatch(formData: FormData) {
  const tutorId = formData.get("tutor_id") as string;
  const studentId = formData.get("student_id") as string;

  const match = await createMatch(tutorId, studentId);

  if (!match) {
    return { error: "Match already exists or failed to create" };
  }

  revalidatePath("/admin/matching");
  return { success: true, match };
}

export async function removeTutorStudentMatch(formData: FormData) {
  const matchId = formData.get("match_id") as string;

  const success = await deleteMatch(matchId);

  if (!success) {
    return { error: "Failed to delete match" };
  }

  revalidatePath("/admin/matching");
  return { success: true };
}

