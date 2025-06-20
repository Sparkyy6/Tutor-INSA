import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../contexts/AuthContext';

interface Session {
  id: string;
  matiere_nom: string;
  date: string;
  duree: number;
  statue: 'attente' | 'oui' | 'non';
  other_user_name: string;
  is_tutor: boolean;
}

const SessionsManagement: React.FC = () => {
  // Existing states
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [exportFormat, setExportFormat] = useState<'ical' | 'google' | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Ajouter ces états pour la navigation dans le calendrier
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const yearSelectorRef = useRef<HTMLDivElement>(null);
  const monthSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user sessions (both as tutor and student)
        const { data: tutorData } = await supabase
          .from('tutor')
          .select('id')
          .eq('user_id', user.id)
          .single();

        const { data: studentData } = await supabase
          .from('student')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // Fetch sessions where this user is either a tutor or student
        let sessionQuery = supabase.from('session').select(`
          id,
          matiere_nom,
          date,
          duree,
          statue,
          eleve,
          tuteur
        `);

        if (tutorData?.id) {
          sessionQuery = sessionQuery.eq('tuteur', tutorData.id);
        } 
        
        if (studentData?.id) {
          if (tutorData?.id) {
            sessionQuery = sessionQuery.or(`eleve.eq.${studentData.id}`);
          } else {
            sessionQuery = sessionQuery.eq('eleve', studentData.id);
          }
        }

        const { data: sessionsData, error: sessionsError } = await sessionQuery
          .order('date', { ascending: true });

        if (sessionsError) throw sessionsError;

        // After getting the sessions, fetch the user names in a separate query
        const formattedSessions = await Promise.all(sessionsData.map(async session => {
          const isTutor = tutorData?.id === session.tuteur;
          
          // Get the other user's ID (student or tutor)
          const otherUserRoleId = isTutor ? session.eleve : session.tuteur;
          
          // Get the user_id from student or tutor table
          const { data: roleData } = await supabase
            .from(isTutor ? 'student' : 'tutor')
            .select('user_id')
            .eq('id', otherUserRoleId)
            .single();
            
          // If we have the user_id, get the name from users table
          let otherUserName = 'Inconnu';
          if (roleData?.user_id) {
            const { data: userData } = await supabase
              .from('users')
              .select('name')
              .eq('id', roleData.user_id)
              .single();
            
            if (userData?.name) {
              otherUserName = userData.name;
            }
          }
          
          return {
            id: session.id,
            matiere_nom: session.matiere_nom,
            date: session.date,
            duree: session.duree,
            statue: session.statue,
            other_user_name: otherUserName,
            is_tutor: isTutor
          };
        }));

        setSessions(formattedSessions);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Erreur lors du chargement des sessions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  // Format a date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status display with color
  const getStatusDisplay = (status: 'attente' | 'oui' | 'non') => {
    if (status === 'attente') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>;
    } else if (status === 'oui') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmé</span>;
    } else {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Refusé</span>;
    }
  };

  // Fonction pour exporter le calendrier au format iCal (.ics)
  const exportToIcal = () => {
    setIsExporting(true);
    
    try {
      // Filtrer seulement les sessions confirmées
      const confirmedSessions = sessions.filter(session => session.statue === 'oui');
      
      // Création du contenu iCal
      let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Tutor INSA//Sessions Calendar//FR'
      ];

      // Ajout des événements
      confirmedSessions.forEach(session => {
        const startDate = new Date(session.date);
        const endDate = new Date(new Date(session.date).getTime() + session.duree * 60000);
        
        const formatICalDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };
        
        icalContent = [
          ...icalContent,
          'BEGIN:VEVENT',
          `UID:${session.id}@tutorinsa`,
          `DTSTAMP:${formatICalDate(new Date())}`,
          `DTSTART:${formatICalDate(startDate)}`,
          `DTEND:${formatICalDate(endDate)}`,
          `SUMMARY:${session.is_tutor ? 'Tutorat avec ' : 'Session avec '} ${session.other_user_name}`,
          `DESCRIPTION:Session de tutorat pour ${session.matiere_nom}`,
          'END:VEVENT'
        ];
      });
      
      // Fermeture du calendrier
      icalContent.push('END:VCALENDAR');
      
      // Création du blob et téléchargement
      const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sessions-tutorat.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportFormat(null);
    } catch (err) {
      console.error('Erreur lors de l\'exportation:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Fonction pour exporter vers Google Calendar (génère un lien)
  const exportToGoogle = () => {
    setIsExporting(true);
    
    try {
      // Filtrer seulement les sessions confirmées
      const confirmedSessions = sessions.filter(session => session.statue === 'oui');
      
      if (confirmedSessions.length === 0) {
        alert('Aucune session confirmée à exporter.');
        setExportFormat(null);
        return;
      }
      
      // Nous allons créer un lien pour le premier événement
      // Google Calendar ne permet pas d'ajouter plusieurs événements en une fois facilement
      const session = confirmedSessions[0];
      const startDate = new Date(session.date);
      const endDate = new Date(new Date(session.date).getTime() + session.duree * 60000);
      
      // Format pour Google Calendar: YYYYMMDDTHHMMSSZ
      const formatGoogleDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      const title = `${session.is_tutor ? 'Tutorat avec ' : 'Session avec '} ${session.other_user_name}`;
      const description = `Session de tutorat pour ${session.matiere_nom}`;
      
      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(description)}`;
      
      // Ouvrir dans un nouvel onglet
      window.open(googleCalUrl, '_blank');
      
      if (confirmedSessions.length > 1) {
        alert('Note: seule la première session a été exportée vers Google Calendar. Pour exporter plusieurs sessions, utilisez le format iCal.');
      }
      
      setExportFormat(null);
    } catch (err) {
      console.error('Erreur lors de l\'exportation:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Fonction qui gère l'exportation en fonction du format choisi
  const handleExport = () => {
    if (exportFormat === 'ical') {
      exportToIcal();
    } else if (exportFormat === 'google') {
      exportToGoogle();
    }
  };

  // Effet pour déclencher l'exportation lorsque le format est choisi
  useEffect(() => {
    if (exportFormat) {
      handleExport();
    }
  }, [exportFormat]);

  // Méthodes pour la navigation dans le calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const selectYear = (year: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearSelector(false);
  };

  const selectMonth = (month: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(month);
      return newDate;
    });
    setShowMonthSelector(false);
  };

  // Effet pour fermer les sélecteurs lors d'un clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (yearSelectorRef.current && !yearSelectorRef.current.contains(event.target as Node)) {
        setShowYearSelector(false);
      }
      if (monthSelectorRef.current && !monthSelectorRef.current.contains(event.target as Node)) {
        setShowMonthSelector(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate calendar view
  const renderCalendar = () => {
    // Group sessions by date (just the day, not time)
    const sessionsByDay: Record<string, Session[]> = {};
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!sessionsByDay[dateStr]) {
        sessionsByDay[dateStr] = [];
      }
      
      sessionsByDay[dateStr].push(session);
    });
    
    // Utiliser currentDate au lieu de today pour le mois affiché
    const today = new Date(); // Garder today pour mettre en évidence le jour actuel
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Calculate days needed for the grid (including days from previous/next months)
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay() || 7; // 0 is Sunday, make it 7
    const lastDayOfWeek = lastDayOfMonth.getDay() || 7;
    
    // Days from previous month
    const prevMonthDays = firstDayOfWeek - 1;
    // Days from next month
    const nextMonthDays = 7 - lastDayOfWeek;
    
    // Calculate days from previous month to show
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const prevMonthStartDay = prevMonthLastDay - prevMonthDays + 1;
    
    // Generate calendar days
    const calendarDays: Array<{ date: Date; isCurrentMonth: boolean; sessions: Session[] }> = [];
    
    // Add previous month days
    for (let i = 0; i < prevMonthDays; i++) {
      const day = new Date(currentYear, currentMonth - 1, prevMonthStartDay + i);
      const dateStr = day.toISOString().split('T')[0];
      calendarDays.push({
        date: day,
        isCurrentMonth: false,
        sessions: sessionsByDay[dateStr] || []
      });
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(currentYear, currentMonth, i);
      const dateStr = day.toISOString().split('T')[0];
      calendarDays.push({
        date: day,
        isCurrentMonth: true,
        sessions: sessionsByDay[dateStr] || []
      });
    }
    
    // Add next month days
    for (let i = 1; i <= nextMonthDays; i++) {
      const day = new Date(currentYear, currentMonth + 1, i);
      const dateStr = day.toISOString().split('T')[0];
      calendarDays.push({
        date: day,
        isCurrentMonth: false,
        sessions: sessionsByDay[dateStr] || []
      });
    }

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    // Générer les années pour le sélecteur (5 ans avant, 5 ans après)
    const currentYearNum = currentDate.getFullYear();
    const years = [];
    for (let i = currentYearNum - 5; i <= currentYearNum + 5; i++) {
      years.push(i);
    }
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToPreviousMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Mois précédent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="relative inline-block text-left">
              {/* Bouton du mois */}
              <button 
                onClick={() => setShowMonthSelector(!showMonthSelector)}
                className="font-semibold text-gray-800 hover:bg-gray-100 rounded px-2 py-1"
              >
                {monthNames[currentMonth]}
              </button>
              
              {/* Sélecteur de mois */}
              {showMonthSelector && (
                <div 
                  ref={monthSelectorRef}
                  className="origin-top-left absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
                >
                  <div className="py-1 grid grid-cols-3 gap-1 p-2" role="menu" aria-orientation="vertical">
                    {monthNames.map((month, idx) => (
                      <button
                        key={month}
                        className={`px-2 py-1 text-sm rounded ${currentMonth === idx ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                        onClick={() => selectMonth(idx)}
                      >
                        {month.substr(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative inline-block text-left">
              {/* Bouton de l'année */}
              <button 
                onClick={() => setShowYearSelector(!showYearSelector)}
                className="font-semibold text-gray-800 hover:bg-gray-100 rounded px-2 py-1"
              >
                {currentYear}
              </button>
              
              {/* Sélecteur d'année */}
              {showYearSelector && (
                <div 
                  ref={yearSelectorRef}
                  className="origin-top-left absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
                >
                  <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                    {years.map((year) => (
                      <button
                        key={year}
                        className={`block px-4 py-2 text-sm w-full text-left ${currentYear === year ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                        onClick={() => selectYear(year)}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={goToNextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Mois suivant"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button 
              onClick={goToToday}
              className="ml-2 px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50"
            >
              Aujourd'hui
            </button>
          </div>
          
          {/* Dropdown pour l'exportation */}
          <div className="relative" ref={exportMenuRef}>
            {/* Bouton Exporter (déjà existant) */}
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Exporter
            </button>
            
            {/* Menu déroulant (déjà existant) */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setExportFormat('ical');
                      setShowExportMenu(false);
                    }}
                    disabled={isExporting}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {isExporting && exportFormat === 'ical' ? 'Exportation en cours...' : 'Exporter au format iCal (.ics)'}
                  </button>
                  <button
                    onClick={() => {
                      setExportFormat('google');
                      setShowExportMenu(false);
                    }}
                    disabled={isExporting}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {isExporting && exportFormat === 'google' ? 'Ouverture...' : 'Ajouter à Google Calendar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => {
            const isToday = day.date.toDateString() === today.toDateString();
            
            return (
              <div 
                key={index} 
                className={`min-h-[100px] p-1 border ${
                  isToday ? 'bg-blue-50 border-blue-300' : 
                  day.isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                } overflow-hidden`}
              >
                <div className={`text-sm font-medium ${
                  day.isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                } mb-1`}>
                  {day.date.getDate()}
                </div>
                
                {/* Sessions existantes */}
                {day.sessions.map(session => (
                  <div 
                    key={session.id}
                    className={`text-xs mb-1 p-1 rounded-sm ${
                      session.statue === 'oui' ? 'bg-green-100 border-l-4 border-green-500' :
                      session.statue === 'attente' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                      'bg-gray-50 border-l-4 border-red-300'
                    }`}
                  >
                    <div className="truncate font-medium">{session.matiere_nom}</div>
                    <div className="truncate">
                      {new Date(session.date).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {session.is_tutor ? ' (tuteur)' : ' (étudiant)'}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Ajout d'un effet pour gérer le clic en dehors du menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-red-600 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Retour à l'accueil
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Gestion des Sessions</h1>
            <div className="w-32"></div> {/* Spacer pour centrer le titre */}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Toggle View */}
          <div className="flex justify-end mb-4">
            <div className="bg-white border border-gray-200 rounded-lg inline-flex">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 text-sm font-medium ${
                  view === 'list' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 text-sm font-medium ${
                  view === 'calendar' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                Calendrier
              </button>
            </div>
          </div>

          {/* Existing content */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold mb-2">Aucune session programmée</h3>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore de sessions de tutorat programmées. 
                Commencez par trouver un tuteur ou devenir tuteur.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retourner à l'accueil
              </Link>
            </div>
          ) : view === 'calendar' ? (
            renderCalendar()
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {sessions.map(session => (
                  <li key={session.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{session.matiere_nom}</h3>
                        <p className="text-sm text-gray-600">
                          {session.is_tutor ? 'Tutorat avec ' : 'Session avec '} 
                          <span className="font-medium">{session.other_user_name}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date:</span> {formatDate(session.date)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Durée:</span> {session.duree} minutes
                        </p>
                      </div>
                      <div>{getStatusDisplay(session.statue)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 text-white text-center py-4 mt-auto text-sm">
        <p>&copy; 2025 INSA Centre-Val de Loire - Plateforme de Tutorat</p>
      </footer>
    </div>
  );
};

export default SessionsManagement;