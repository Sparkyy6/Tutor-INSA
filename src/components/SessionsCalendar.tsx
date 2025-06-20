import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import frLocale from '@fullcalendar/core/locales/fr';
import { getSessionsForUser } from '../services/sessions';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
          end: new Date(new Date(s.date).getTime() + (s.duree || s.duration) * 60000).toISOString(),
          backgroundColor:
            s.statue === 'oui'
              ? '#2563eb'
              : s.statue === 'attente'
              ? '#facc15'
              : '#ef4444',
          borderColor: '#e5e7eb',
          textColor: '#fff',
          extendedProps: {
            status: s.statue,
            duree: s.duree || s.duration,
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

  function exportToPDF() {
    const calendarEl = document.getElementById('calendar-export');
    if (!calendarEl) return;
    html2canvas(calendarEl).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('mes-sessions.pdf');
    });
  }

  function exportToICS(events: any[]) {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TutorINSA//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;
    events.forEach(ev => {
      const start = new Date(ev.start);
      const end = new Date(ev.end);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatDate = (d: Date) =>
        `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
      icsContent += `BEGIN:VEVENT
SUMMARY:${ev.title}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
DESCRIPTION:Durée: ${ev.extendedProps?.duree || ''} min
END:VEVENT
`;
    });
    icsContent += 'END:VCALENDAR';
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mes-sessions.ics';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-4 text-center shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold">Tutor'INSA</h1>
          <Link
            to="/"
            className="bg-white text-red-700 hover:bg-red-100 px-4 py-2 rounded-md font-semibold text-sm transition-colors"
          >
            Accueil
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-4xl font-bold mb-2 text-center text-blue-800 tracking-tight">
            Mes Sessions
          </h1>
          <h2 className="text-lg font-medium mb-6 text-center text-gray-700">Calendrier de mes rendez-vous tutorat</h2>
          {/* Boutons d'export */}
          <div className="flex justify-end gap-4 mb-4">
            <button
              onClick={exportToPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm shadow"
            >
              Exporter en PDF
            </button>
            <button
              onClick={() => exportToICS(events)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm shadow"
            >
              Exporter en iCal (.ics)
            </button>
          </div>
          <div className="bg-white rounded-xl shadow p-4 md:p-8" id="calendar-export">
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
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white text-center py-4 mt-auto text-sm">
        <p>&copy; 2025 INSA Centre-Val de Loire - Plateforme de Tutorat</p>
      </footer>
    </div>
  );
}

// N'oublie pas d'installer les dépendances si besoin :
/*
npm install jspdf html2canvas
*/