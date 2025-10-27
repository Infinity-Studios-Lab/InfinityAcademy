import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import redirectUser from "@/utils/roles/redirectUser";

export default async function PublicHome() {
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
