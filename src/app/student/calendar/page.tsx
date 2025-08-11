import Calendar from '@/components/Calendar'

export default function StudentCalendarPage() {
  const events = [{ id: '1', title: 'Math Tutoring', start: new Date().toISOString(), end: new Date(Date.now() + 60*60*1000).toISOString() }]
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Calendar</h2>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <Calendar events={events} />
        </div>
      </div>
    </div>
  )
}
