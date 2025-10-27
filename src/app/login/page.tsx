import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { login } from "./actions";
import Link from "next/link";
import redirectUser from "@/utils/roles/redirectUser";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6 text-center">Welcome Back</h2>
          <p className="text-center text-base-content/70 mb-6">
            Sign in to your Infinity Academy account
          </p>

          {message && (
            <div className="alert alert-info mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>{message}</span>
            </div>
          )}

          <form className="flex flex-col gap-4">
            <div className="form-control">
              <label htmlFor="email" className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                className="input input-bordered"
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-control">
              <label htmlFor="password" className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                className="input input-bordered"
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary" formAction={login}>
                Sign In
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm text-base-content/70">
              Don't have an account?{" "}
              <Link href="/signup" className="link link-primary">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
