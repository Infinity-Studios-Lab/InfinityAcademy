"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  console.log(`[Login Action] Attempting login for email: ${data.email}`);

  const { data: authData, error } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    console.error(`[Login Action] Login error:`, error);
    redirect("/error");
  }

  console.log(
    `[Login Action] Login successful for user:`,
    authData.user?.email
  );
  console.log(
    `[Login Action] Session:`,
    authData.session ? "valid" : "invalid"
  );

  revalidatePath("/", "layout");
  redirect("/student");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  // After signup, redirect to login page
  revalidatePath("/", "layout");
  redirect("/login?message=Please check your email to confirm your account");
}
