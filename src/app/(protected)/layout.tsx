import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please login to access this page");
  }

  // Verify user record exists, create if missing
  const { data: userRecord, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error checking user record:", error);
  }

  if (!userRecord && !error) {
    // User record doesn't exist, try to create it
    const role = user.user_metadata?.role || user.raw_user_meta_data?.role || 'student';
    const { error: insertError } = await supabase
      .from("users")
      .insert([{
        id: user.id,
        email: user.email!,
        role: role,
        profile_data: {},
      }]);

    if (insertError) {
      console.error("Error creating user record in layout:", insertError);
    }
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <div className="navbar bg-base-100 border-b">
          <div className="flex-none lg:hidden">
            <label htmlFor="app-drawer" className="btn btn-ghost btn-square">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <div className="flex items-center text-xl normal-case">
              <Image
                src="/logo.png"
                alt="Infinity Academy"
                width={28}
                height={28}
                className="mr-2"
              />
              Infinity Academy
            </div>
          </div>
          <div className="flex-none">
            <form action="/auth/logout" method="post">
              <button type="submit" className="btn btn-ghost">
                Logout
              </button>
            </form>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
