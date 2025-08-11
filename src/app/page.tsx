import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="hero bg-base-200 rounded-xl">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold">Welcome to Infinity Academy</h1>
            <p className="py-6 text-base-content/70">Choose a dashboard to get started. Auth is stubbed for now.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link className="btn btn-primary" href="/student">Student</Link>
              <Link className="btn btn-secondary" href="/tutor">Tutor</Link>
              <Link className="btn btn-accent" href="/parent">Parent</Link>
              <Link className="btn" href="/admin">Admin</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Scheduling</h3>
            <p>Request and confirm lessons from a shared calendar.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Homework & Coins</h3>
            <p>Earn in-app currency for completing homework.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Chat & AI Feedback</h3>
            <p>Tutors can chat with students and review AI feedback.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-primary text-primary-content rounded">Tailwind + DaisyUI OK</div>
    </div>
  );
}
