import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Star, 
  BookOpen, 
  MessageCircle,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: "Tuteurs qualifiés",
      description: "Étudiants expérimentés de l'INSA CVL dans toutes les matières"
    },
    {
      icon: Calendar,
      title: "Réservation facile",
      description: "Planifiez vos sessions en quelques clics selon vos disponibilités"
    },
    {
      icon: MessageCircle,
      title: "Communication directe",
      description: "Échangez avec vos tuteurs via notre système de messagerie intégré"
    },
    {
      icon: Star,
      title: "Suivi des progrès",
      description: "Évaluez vos sessions et suivez votre évolution académique"
    }
  ];

  const benefits = [
    { title: "Communauté active", description: "Rejoignez une communauté d'étudiants motivés" },
    { title: "Expertise reconnue", description: "Tuteurs sélectionnés pour leurs compétences" },
    { title: "Flexibilité totale", description: "Sessions adaptées à votre emploi du temps" },
    { title: "Qualité garantie", description: "Système d'évaluation pour un service optimal" }
  ];

  const departments = [
    "Génie Civil",
    "Génie Informatique", 
    "Génie Mécanique",
    "Génie Énergétique",
    "Génie des Matériaux",
    "Sécurité et Technologies"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">INSA CVL Tutorat</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/auth?mode=login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors"
              >
                Se connecter
              </Link>
              <Link 
                to="/auth?mode=signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Réussissez vos études à
              <span className="text-blue-600 block">l'INSA CVL</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Trouvez l'aide personnalisée dont vous avez besoin avec nos tuteurs étudiants 
              expérimentés. Sessions en ligne ou en présentiel sur les campus de Blois et Bourges.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/auth?mode=signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Commencer maintenant</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/auth?mode=login"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-xl font-bold text-blue-600 mb-2">
                  {benefit.title}
                </div>
                <div className="text-gray-600">{benefit.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir notre plateforme ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour l'entraide étudiante à l'INSA Centre-Val de Loire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tous les départements couverts
            </h2>
            <p className="text-xl text-gray-600">
              Trouvez de l'aide dans votre domaine d'études
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-900 font-medium">{department}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à améliorer vos résultats ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez dès maintenant la communauté d'entraide de l'INSA CVL
          </p>
          <Link 
            to="/auth?mode=signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>S'inscrire gratuitement</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">INSA CVL Tutorat</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 INSA Centre-Val de Loire. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}