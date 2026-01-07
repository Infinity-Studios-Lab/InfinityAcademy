import redirectUser from "@/utils/roles/redirectUser";
import Link from "next/link";

export default async function TutorHome() {
  await redirectUser(["tutor"]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tutor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/tutor/availability" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body">
            <h2 className="card-title">Set Availability</h2>
            <p>Set your available days and times for tutoring</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Set Availability</button>
            </div>
          </div>
        </Link>
        <Link href="/tutor/lessons" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body">
            <h2 className="card-title">My Lessons</h2>
            <p>View and manage your scheduled tutoring lessons</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">View Lessons</button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
