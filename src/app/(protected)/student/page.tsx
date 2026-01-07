import redirectUser from "@/utils/roles/redirectUser";
import Link from "next/link";

export default async function StudentHome() {
  await redirectUser(["student"]);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/student/schedule" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body">
            <h2 className="card-title">Schedule a Lesson</h2>
            <p>Book a tutoring session with your matched tutor</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Schedule Now</button>
            </div>
          </div>
        </Link>
        <Link href="/student/lessons" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body">
            <h2 className="card-title">My Lessons</h2>
            <p>View your scheduled tutoring lessons and join meetings</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">View Lessons</button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
