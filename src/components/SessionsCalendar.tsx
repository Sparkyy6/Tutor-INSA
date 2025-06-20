import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import frLocale from '@fullcalendar/core/locales/fr';
import { getSessionsForUser } from '../services/sessions';

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m}`;
}

export default function SessionsCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getSessionsForUser(user.id).then(sessions => {
      setEvents(
        sessions.map((s: any) => ({
          id: s.id,
          title: s.matiere_nom || 'Session',
          start: s.date,
          end: new Date(new Date(s.date).getTime() + s.duree * 60000).toISOString(),
          backgroundColor:
            s.statue === 'oui'
              ? '#2563eb' // bleu pro
              : s.statue === 'attente'
              ? '#facc15'
              : '#ef4444',
          borderColor: '#e5e7eb',
          textColor: '#fff',
          extendedProps: {
            status: s.statue,
            duree: s.duree,
            matiere: s.matiere_nom,
            departement: s.matiere_departement,
          }
        }))
      );
    }).finally(() => setLoading(false));
  }, [user]);

  function renderEventContent(eventInfo: any) {
    const { status, duree, matiere } = eventInfo.event.extendedProps;
    let statusLabel = 'En attente';
    if (status === 'oui') statusLabel = 'Validée';
    else if (status === 'non') statusLabel = 'Refusée';

    return (
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{matiere}</span>
        <span className="text-xs text-gray-100">{formatDuration(duree)}</span>
        <span className="text-xs mt-1 italic opacity-80">{statusLabel}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-2 text-center text-blue-800 tracking-tight">
        Mes Sessions
      </h1>
      <h2 className="text-lg font-medium mb-6 text-center text-gray-700">Calendrier de mes rendez-vous tutorat</h2>
      <div className="bg-white rounded-xl shadow p-4 md:p-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            locale={frLocale}
            height="auto"
            eventContent={renderEventContent}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            dayMaxEventRows={3}
            fixedWeekCount={false}
            eventDisplay="block"
            displayEventTime={false}
          />
        )}
      </div>
    </div>
  );
}