import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PublicHome() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is logged in, redirect to student dashboard
    if (user) {
      redirect("/student");
    }
  } catch (error) {
    // Handle authentication errors gracefully
    console.log("Authentication check failed, showing public home");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Infinity Academy</h1>
        <p className="text-xl text-base-content/70">
          Please sign in to access your dashboard
        </p>
        <Link href="/login" className="btn btn-primary btn-lg">
          Sign In
        </Link>
      </div>
    </div>
  );
}
