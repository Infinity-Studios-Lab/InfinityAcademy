import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please login to access this page");
  }

  // Get user role from users table
  const { data: userRecord } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRecord?.role) {
    const userRole = userRecord.role;

    if (userRole === "student") {
      redirect("/student");
    } else if (userRole === "parent") {
      redirect("/parent");
    } else if (userRole === "tutor") {
      redirect("/tutor");
    } else if (userRole === "admin") {
      redirect("/admin");
    }
  }

  // Fallback to login if no role found
  redirect("/login?message=Please complete your account setup");
}
