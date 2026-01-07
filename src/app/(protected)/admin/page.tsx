import redirectUser from "@/utils/roles/redirectUser";
import Link from "next/link";

export default async function AdminHome() {
  await redirectUser(["admin"]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/matching" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body">
            <h2 className="card-title">Match Students & Tutors</h2>
            <p>Create and manage matches between students and tutors</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Manage Matches</button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
