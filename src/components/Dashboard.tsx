import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, TrendingUp, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  upcomingSessions: number;
  totalSessions: number;
  averageRating: number;
  subjectsOffered: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingSessions: 0,
    totalSessions: 0,
    averageRating: 0,
    subjectsOffered: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch upcoming sessions (mock data for now)
      setStats({
        upcomingSessions: 3,
        totalSessions: 12,
        averageRating: 4.8,
        subjectsOffered: user?.is_tutor ? 5 : 0,
      });
      
      setUpcomingSessions([
        {
          id: 1,
          subject: 'Mathématiques',
          time: '14:00',
          date: 'Aujourd\'hui',
          tutor: 'Marie Dubois',
          type: 'En ligne',
        },
        {
          id: 2,
          subject: 'Physique',
          time: '16:30',
          date: 'Demain',
          tutor: 'Jean Martin',
          type: 'Présentiel',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    color, 
    subtitle 
  }: { 
    icon: any, 
    title: string, 
    value: string | number, 
    color: string, 
    subtitle?: string 
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bonjour, {user?.full_name} ! 👋
        </h1>
        <p className="text-blue-100">
          {user?.is_tutor 
            ? 'Gérez vos sessions de tutorat et aidez vos camarades à réussir.'
            : 'Trouvez l\'aide dont vous avez besoin pour exceller dans vos études.'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Calendar}
          title="Sessions à venir"
          value={stats.upcomingSessions}
          color="bg-blue-500"
          subtitle="Cette semaine"
        />
        <StatCard
          icon={BookOpen}
          title="Sessions totales"
          value={stats.totalSessions}
          color="bg-green-500"
          subtitle="Ce semestre"
        />
        {user?.is_tutor && (
          <StatCard
            icon={Users}
            title="Matières enseignées"
            value={stats.subjectsOffered}
            color="bg-purple-500"
          />
        )}
        {/* Supprimé la carte "Note moyenne" */}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Sessions à venir</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Voir tout
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune session programmée</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Planifier une session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{session.subject}</h3>
                      <p className="text-sm text-gray-500">
                        avec {session.tutor} • {session.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{session.date}</p>
                    <p className="text-sm text-gray-500">{session.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Trouver un tuteur</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Recherchez des tuteurs expérimentés dans votre matière
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Commencer →
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Planifier une session</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Réservez un créneau qui vous convient
          </p>
          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
            Planifier →
          </button>
        </div>

        {/* Supprimé la section "Mes progrès" */}
      </div>
    </div>
  );
}