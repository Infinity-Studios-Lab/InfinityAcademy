import { createClient } from "@/utils/supabase/server";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import LoginPage from "./login/page";

export const metadata = {
  title: "Infinity Academy Panel",
  description: "Tutor/Parent/Student panel",
};

export default async function RootLayout({ children}: {children: React.ReactNode;}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" data-theme="business">
      <body className="min-h-screen">
      {!user ? (
          <LoginPage />
        ) : (
        <div className="drawer lg:drawer-open">
          <input id="app-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col">
            <div className="navbar bg-base-100 border-b">
              <div className="flex-none lg:hidden">
                <label
                  htmlFor="app-drawer"
                  className="btn btn-ghost btn-square"
                >
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
                <Link href="/" className="btn btn-ghost text-xl normal-case">
                  <Image
                    src="/logo.png"
                    alt="Infinity Academy"
                    width={28}
                    height={28}
                    className="mr-2"
                  />
                  Infinity Academy
                </Link>
              </div>
            </div>
            <div className="p-6">{children}</div>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="app-drawer"
              className="drawer-overlay"
              aria-label="close sidebar"
            ></label>
            <aside className="w-64 bg-base-200 min-h-full p-4">
              <ul className="menu">
                <li className="menu-title">Dashboards</li>
                <li>
                  <Link href="/student">Student</Link>
                </li>
                <li>
                  <Link href="/tutor">Tutor</Link>
                </li>
                <li>
                  <Link href="/parent">Parent</Link>
                </li>
                <li>
                  <Link href="/admin">Admin</Link>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      )}
      </body>
    </html>
  );
}
