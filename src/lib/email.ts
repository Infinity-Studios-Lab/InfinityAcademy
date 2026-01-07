/**
 * Email reminder system
 * Sends email reminders to students and tutors about upcoming lessons
 * 
 * This uses Supabase Edge Functions or a third-party email service
 * For development, we'll create API routes that can be connected to SendGrid, Resend, etc.
 */

export interface EmailReminder {
  to: string;
  subject: string;
  html: string;
  lessonId: string;
}

export async function sendLessonReminder(reminder: EmailReminder): Promise<boolean> {
  try {
    // In production, this would call your email service API
    // For now, we'll use a Next.js API route
    const response = await fetch('/api/email/send-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reminder),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email reminder:', error);
    return false;
  }
}

export function generateReminderEmail(
  recipientName: string,
  lessonTitle: string,
  startTime: string,
  endTime: string,
  googleMeetLink?: string,
  isTutor: boolean = false
): string {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedStartTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedEndTime = endDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const otherParty = isTutor ? 'your student' : 'your tutor';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Lesson Reminder - Infinity Academy</h2>
          <p>Hello ${recipientName},</p>
          <p>This is a reminder that you have a tutoring lesson scheduled:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Lesson:</strong> ${lessonTitle}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedStartTime} - ${formattedEndTime}</p>
            ${googleMeetLink ? `<p><strong>Meeting Link:</strong> <a href="${googleMeetLink}">${googleMeetLink}</a></p>` : ''}
          </div>
          <p>Please make sure you're ready for the lesson with ${otherParty}.</p>
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          <p>Best regards,<br>Infinity Academy Team</p>
        </div>
      </body>
    </html>
  `;
}

