import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, MapPin, BookOpen, User, MessageCircle, GraduationCap, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TutorProfile, Subject, Campus } from '../types';

export default function TutorsList() {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<TutorProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const departments = [
    'Génie Civil',
    'Génie Énergétique', 
    'Génie Informatique',
    'Génie Mécanique',
    'Génie des Matériaux',
    'Sécurité et Technologies',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTutors();
  }, [searchTerm, selectedDepartment, selectedSubject, selectedCampus, tutors]);

  const fetchData = async () => {
    try {
      // Fetch tutors with their subjects and reviews
      const { data: tutorsData, error: tutorsError } = await supabase
        .from('users')
        .select(`
          *,
          campus:campuses(*),
          tutor_subjects:tutor_subjects(
            *,
            subject:subjects(*)
          ),
          reviews_received:reviews!reviewed_id(
            rating,
            comment,
            created_at
          )
        `)
        .eq('is_tutor', true)
        .eq('role', 'tutor');

      if (tutorsError) throw tutorsError;

      // Calculate ratings and session counts for each tutor
      const tutorsWithStats = (tutorsData || []).map(tutor => {
        const reviews = tutor.reviews_received || [];
        const rating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
          : 0;
        
        return {
          ...tutor,
          subjects: tutor.tutor_subjects || [],
          rating: Math.round(rating * 10) / 10,
          total_sessions: reviews.length, // For now, using reviews count as session count
          reviews: reviews,
        };
      });

      setTutors(tutorsWithStats);

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('department, year_level, name');

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      // Fetch campuses
      const { data: campusesData, error: campusesError } = await supabase
        .from('campuses')
        .select('*')
        .order('name');

      if (campusesError) throw campusesError;
      setCampuses(campusesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTutors = () => {
    let filtered = tutors;

    if (searchTerm) {
      filtered = filtered.filter(tutor => 
        tutor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects.some((ts: any) => 
          ts.subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(tutor => tutor.department === selectedDepartment);
    }

    if (selectedSubject) {
      filtered = filtered.filter(tutor => 
        tutor.subjects.some((ts: any) => ts.subject_id === selectedSubject)
      );
    }

    if (selectedCampus) {
      filtered = filtered.filter(tutor => tutor.campus_id === parseInt(selectedCampus));
    }

    setFilteredTutors(filtered);
  };

  const handleBookSession = async (tutorId: string) => {
    // TODO: Implement session booking
    console.log('Booking session with tutor:', tutorId);
  };

  const handleSendMessage = async (tutorId: string) => {
    // TODO: Implement messaging
    console.log('Sending message to tutor:', tutorId);
  };

  const TutorCard = ({ tutor }: { tutor: TutorProfile }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {tutor.profile_picture_url ? (
              <img
                src={tutor.profile_picture_url}
                alt={tutor.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {tutor.full_name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{tutor.full_name}</h3>
            <p className="text-sm text-gray-600">
              {tutor.department} 
              {tutor.year_level ? ` - Année ${tutor.year_level}` : ''}
            </p>
            <p className="text-xs text-gray-500">{tutor.campus?.city}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {tutor.rating > 0 ? tutor.rating : 'Nouveau'}
              </span>
              <span className="text-sm text-gray-500">
                ({tutor.total_sessions} session{tutor.total_sessions !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </div>
      </div>

      {tutor.bio && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center space-x-1 mb-2">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Matières:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tutor.subjects.slice(0, 4).map((tutorSubject: any, index: number) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
            >
              {tutorSubject.subject?.name}
            </span>
          ))}
          {tutor.subjects.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              +{tutor.subjects.length - 4} autres
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => handleBookSession(tutor.id)}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Réserver</span>
        </button>
        <button 
          onClick={() => handleSendMessage(tutor.id)}
          className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Message</span>
        </button>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trouver un tuteur</h1>
          <p className="text-gray-600 mt-1">Découvrez les meilleurs tuteurs de l'INSA CVL</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">{filteredTutors.length} tuteur(s) disponible(s)</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom ou matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors lg:w-auto"
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tous les campus</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>{campus.city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tous les départements</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matière</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Toutes les matières</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>

      {filteredTutors.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun tuteur trouvé</h3>
          <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
}