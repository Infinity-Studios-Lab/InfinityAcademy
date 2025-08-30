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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log(
    `[Protected Layout] User: ${user ? user.email : "not authenticated"}`
  );
  console.log(`[Protected Layout] Auth error: ${error || "none"}`);

  // If no user, redirect to login page
  if (!user) {
    console.log(`[Protected Layout] Redirecting to login`);
    redirect("/login?message=Please login to access this page");
  }

  console.log(`[Protected Layout] User authenticated, showing dashboard`);

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
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
