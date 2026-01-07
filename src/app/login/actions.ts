"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import redirectUser from "@/utils/roles/redirectUser";

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
    
    // Provide user-friendly error messages
    let errorMessage = "An error occurred during login. Please try again.";
    
    if (error.message.includes("Invalid login credentials") || 
        error.message.includes("invalid_credentials") ||
        error.message.includes("Email not confirmed")) {
      errorMessage = "Invalid email or password. Please check your credentials and try again.";
    } else if (error.message.includes("Email rate limit exceeded")) {
      errorMessage = "Too many login attempts. Please wait a few minutes before trying again.";
    } else if (error.message.includes("User not found")) {
      errorMessage = "No account found with this email address. Please check your email or sign up.";
    } else if (error.message) {
      // Use the error message if it's user-friendly, otherwise use generic message
      errorMessage = error.message;
    }
    
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
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
  
  // Get user role and redirect to appropriate dashboard
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (authUser) {
    // Try to get role from database
    const { data: userRecord } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .maybeSingle();
    
    const role = userRecord?.role || 
                 authUser.user_metadata?.role || 
                 authUser.raw_user_meta_data?.role || 
                 'student';
    
    // Redirect based on role
    if (role === "student") {
      redirect("/student");
    } else if (role === "parent") {
      redirect("/parent");
    } else if (role === "tutor") {
      redirect("/tutor");
    } else if (role === "admin") {
      redirect("/admin");
    } else {
      redirect("/student"); // Default fallback
    }
  } else {
    redirect("/");
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const role = (formData.get("role") as string) || "student"; // Default to student

  // Sign up the user
  // Note: If you have a database trigger, it will create the users record automatically
  // If the trigger fails, we'll create it manually below or on email confirmation
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        role: role, // Store role in user metadata for later use
      },
    },
  });

  if (error) {
    console.error("Signup error:", error);
    
    // Provide user-friendly error messages
    let errorMessage = "An error occurred during signup. Please try again.";
    
    if (error.message.includes("User already registered") || 
        error.message.includes("already registered") ||
        error.message.includes("email_address_already_exists")) {
      errorMessage = "An account with this email already exists. Please sign in instead.";
    } else if (error.message.includes("Password") && error.message.includes("weak")) {
      errorMessage = "Password is too weak. Please use a stronger password (at least 8 characters).";
    } else if (error.message.includes("Email rate limit exceeded")) {
      errorMessage = "Too many signup attempts. Please wait a few minutes before trying again.";
    } else if (error.message.includes("Invalid email")) {
      errorMessage = "Please enter a valid email address.";
    } else if (error.message.includes("Database error")) {
      errorMessage = "Database error. Please try again or contact support.";
    } else if (error.message) {
      // Use the error message if it's user-friendly
      errorMessage = error.message;
    }
    
    redirect(`/signup?error=${encodeURIComponent(errorMessage)}`);
    return;
  }

  // Try to create user record, but don't fail if it doesn't work
  // (it might be created by a trigger, or we'll create it on email confirmation)
  if (authData.user) {
    try {
      const { error: userError } = await supabase
        .from("users")
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email!,
            role: role,
            profile_data: {},
          },
        ])
        .select();

      if (userError) {
        // Check if it's a duplicate (user already exists or trigger created it)
        if (userError.code === "23505" || userError.message.includes("duplicate")) {
          console.log("User record already exists (likely created by trigger)");
        } else {
          console.error("Error creating user record:", userError);
          // Don't fail - user can still confirm email and we'll create record then
        }
      }
    } catch (err) {
      console.error("Exception creating user record:", err);
      // Continue anyway - email confirmation will handle it
    }
  }

  // After signup, redirect to login page
  revalidatePath("/", "layout");
  redirect("/login?message=Please check your email to confirm your account");
}
