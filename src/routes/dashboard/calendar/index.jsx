import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const CalendarPage = () => {
  const supabase = useSupabaseClient();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        headers: {
          'Authorization': `Bearer ${session.provider_token}`
        }
      });
      const data = await res.json();
      setEvents(data.items.map(event => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date
      })));
    };

    fetchEvents();
  }, []);

  return (
    <div className="calendar-view">
      {/* <h1>PCI Compliance Calendar</h1> */}
      <FullCalendar
        plugins={[dayGridPlugin, googleCalendarPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
      />
    </div>
  );
};

export default CalendarPage;