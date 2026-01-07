import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signup } from "../login/actions";
import Link from "next/link";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { error: errorMessage } = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to student dashboard
  if (user) {
    redirect("/student");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6 text-center">
            Create Account
          </h2>
          <p className="text-center text-base-content/70 mb-6">
            Join Infinity Academy and start your learning journey
          </p>

          {errorMessage && (
            <div className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{errorMessage}</span>
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
                minLength={8}
                placeholder="Create a password (min. 8 characters)"
                aria-describedby="password-help"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Password must be at least 8 characters long
                </span>
              </label>
            </div>
            <div className="form-control">
              <label htmlFor="role" className="label">
                <span className="label-text">I am a</span>
              </label>
              <select
                className="select select-bordered w-full"
                id="role"
                name="role"
                required
                defaultValue="student"
              >
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="parent">Parent</option>
              </select>
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary" formAction={signup}>
                Create Account
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm text-base-content/70">
              Already have an account?{" "}
              <Link href="/login" className="link link-primary">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
