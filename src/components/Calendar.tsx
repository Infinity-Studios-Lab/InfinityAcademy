'use client'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
// FullCalendar CSS (v6); if these fail, switch to the commented set below:
import '@fullcalendar/core/index.css'
import '@fullcalendar/timegrid/index.css'
// import '@fullcalendar/common/main.css'
// import '@fullcalendar/timegrid/main.css'

export default function Calendar({ events }: { events: any[] }) {
  return (
    <div className="border rounded">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        height="auto"
      />
    </div>
  )
}
