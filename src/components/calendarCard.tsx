import React from "react";

/*
 * A union type for values that can be provided as a date/time input.
 * - string: an ISO date/time string or a time-only string like "14:30"
 * - Date: a JavaScript Date instance
 */
type DateInput = string | Date;

/*
 * Props accepted by the CalendarCard component:
 * - date: the date of the event (Date or string)
 * - time: the time of the event (Date or string)
 * - event: the event title
 * - name: the name of the person associated with the event
 * - className: optional CSS class for the outer container
 */
interface CalendarCardProps {
    date: DateInput;
    time: DateInput;
    event: string;
    name: string;
    className?: string;
}

/*
 * formatDate
 * - Accepts DateInput and returns a human-readable date string.
 * - If given a valid Date instance, uses toLocaleDateString().
 * - If given a string, attempts to parse to a Date and format it.
 * - If parsing fails, returns the original input converted to string.
 */
function formatDate(d: DateInput) {
    if (d instanceof Date && !isNaN(d.getTime())) {
        return d.toLocaleDateString();
    }
    const parsed = new Date(d as string);
    return isNaN(parsed.getTime()) ? String(d) : parsed.toLocaleDateString();
}

/*
 * formatTime
 * - Accepts DateInput and returns a human-readable time string (HH:MM).
 * - If given a valid Date instance, returns a localized time string with hours and minutes.
 * - If given a string that looks like a time-only string (e.g. "14:30" or "2:30 PM"),
 *   it returns the trimmed string as-is to preserve the user's input.
 * - Otherwise attempts to parse the string as a Date and format the time; falls back to
 *   returning the original input as string if parsing fails.
 */
function formatTime(t: DateInput) {
    if (t instanceof Date && !isNaN(t.getTime())) {
        return t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    // If input is a time-only string like "14:30" or "2:30 PM", return as-is
    if (typeof t === "string" && /^\d{1,2}:\d{2}(\s?[APMapm]{2})?$/.test(t.trim())) {
        return t.trim();
    }
    const parsed = new Date(t as string);
    return isNaN(parsed.getTime())
        ? String(t)
        : parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/*
 * CalendarCard
 * - A presentational React component that displays a small card describing a calendar event.
 * - Uses formatDate and formatTime to produce display strings for the provided props.
 * - Applies simple inline styles for layout and visual appearance.
 * - Includes an accessible aria-label that summarizes the event for screen readers.
 */
export default function CalendarCard(props: CalendarCardProps) {
    const { date, time, event, name, className } = props;

    // Convert inputs to displayable strings
    const displayDate = formatDate(date);
    const displayTime = formatTime(time);

    return (
        <div
            className={className}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: 12,
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "#fff",
                maxWidth: 360,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
            }}
            // Provide a concise, descriptive label for assistive tech
            aria-label={`Calendar event ${event} on ${displayDate} at ${displayTime} by ${name}`}
        >
            {/* Header block: event title and date/time */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>{event}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>
                    {displayDate} · {displayTime}
                </div>
            </div>

            {/* Footer: organizer or person name */}
            <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{name}</div>
        </div>
    );
}