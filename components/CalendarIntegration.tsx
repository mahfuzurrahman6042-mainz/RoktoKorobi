"use client";

interface CalendarIntegrationProps {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
}

export default function CalendarIntegration({ title, description, location, date, time }: CalendarIntegrationProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(date)}/${formatDate(date)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

  const downloadICal = () => {
    const eventDate = new Date(date);
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(date)}`,
      `DTEND:${formatDate(date)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blood-donation-event.ics';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <button
        onClick={() => window.open(googleCalendarUrl, '_blank')}
        style={{
          background: '#4285F4',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600
        }}
      >
        Add to Google Calendar
      </button>
      <button
        onClick={downloadICal}
        style={{
          background: '#6b7280',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600
        }}
      >
        Download iCal
      </button>
    </div>
  );
}
