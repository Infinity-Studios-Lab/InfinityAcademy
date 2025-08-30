import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signup } from "../login/actions";
import Link from "next/link";

export default async function SignupPage() {
  const supabase = await createClient();

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
                placeholder="Create a password"
              />
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
