import React, { useState, useEffect } from 'react';
// npm install react react-dom @types/react @types/react-dom
import './index.css';
import { registerUser } from './services/auth';
import { supabase } from './lib/supabase';

function App() {
    const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'register'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'student',
        department: '',
        year: '',
        subject: '',
        availablehours: '',
    });

    useEffect(() => {
        async function testConnection() {
            const { error } = await supabase.from('student').select('*').limit(1);
            if (error) {
                console.error('❌ Connexion Supabase échouée :', error.message);
            } else {
                console.log('✅ Connexion Supabase réussie !');
            }
        }
        testConnection();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentView === 'login') {
            console.log('Login attempt with:', { email: formData.email, password: formData.password });
            // TODO: Implement actual login logic
        } else if (currentView === 'register') {
            if (formData.password !== formData.confirmPassword) {
                alert("Les mots de passe ne correspondent pas!");
                return;
            }
            try {
                await registerUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role as 'student' | 'tutor',
                    department: formData.department,
                    year: formData.role === 'student' ? Number(formData.year) : undefined,
                    subject: formData.role === 'tutor' ? formData.subject.split(',').map(s => s.trim()) : undefined,
                    availablehours: formData.role === 'tutor' ? formData.availablehours.split(',').map(s => s.trim()) : undefined,
                });
                alert('Inscription réussie !');
                setCurrentView('login');
            } catch (error: any) {
                alert(error.message || 'Erreur lors de l\'inscription');
            }
        }
    };

    const renderView = () => {
        switch(currentView) {
            case 'login':
                return (
                    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Connexion</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out mt-6"
                            >
                                Se connecter
                            </button>
                        </form>
                        
                        <div className="text-center mt-6 text-sm text-gray-600">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="text-red-600 hover:text-red-700 font-medium underline ml-2 focus:outline-none"
                            >
                                Retour à l'accueil
                            </button>
                        </div>
                    </div>
                );
            
            case 'register':
                return (
                    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Inscription</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Choix du rôle */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Je suis :</label>
                                <select
                                    name="role"
                                    value={formData.role || 'student'}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="student">Étudiant</option>
                                    <option value="tutor">Tuteur</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Champs spécifiques selon le rôle */}
                            {formData.role === 'student' && (
                                <>
                                    <div className="mb-4">
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                                        <input
                                            type="text"
                                            id="department"
                                            name="department"
                                            value={formData.department || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                                        <input
                                            type="number"
                                            id="year"
                                            name="year"
                                            value={formData.year || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                </>
                            )}
                            {formData.role === 'tutor' && (
                                <>
                                    <div className="mb-4">
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                                        <input
                                            type="text"
                                            id="department"
                                            name="department"
                                            value={formData.department || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Matières (séparées par une virgule)</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Maths, Physique, ..."
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="availablehours" className="block text-sm font-medium text-gray-700 mb-1">Disponibilités (séparées par une virgule)</label>
                                        <input
                                            type="text"
                                            id="availablehours"
                                            name="availablehours"
                                            value={formData.availablehours || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Lundi 18h, Mercredi 14h, ..."
                                        />
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out mt-6"
                            >
                                S'inscrire
                            </button>
                        </form>
                        
                        <div className="text-center mt-6 text-sm text-gray-600">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="text-red-600 hover:text-red-700 font-medium underline ml-2 focus:outline-none"
                            >
                                Retour à l'accueil
                            </button>
                        </div>
                    </div>
                );
            
            default: // 'home'
                return (
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-8 text-gray-800">Plateforme de Tutorat INSA CVL</h2>
                        <p className="text-xl mb-12 text-gray-600">
                            Connectez-vous ou inscrivez-vous pour accéder à la plateforme d'entraide et de tutorat 
                            entre étudiants de l'INSA Centre-Val de Loire.
                        </p>
                        
                        <div className="flex flex-col md:flex-row justify-center gap-6">
                            <button 
                                onClick={() => setCurrentView('login')}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 text-lg"
                            >
                                Connexion
                            </button>
                            <button 
                                onClick={() => setCurrentView('register')}
                                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 text-lg"
                            >
                                Inscription
                            </button>
                        </div>
                        
                        {/* Image décorative ou logo */}
                        <div className="mt-16 bg-gray-100 p-8 rounded-lg shadow-inner">
                            <h3 className="text-2xl font-semibold mb-4 text-gray-700">Pourquoi utiliser notre plateforme ?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className="bg-white p-5 rounded-lg shadow-md">
                                    <div className="text-red-600 text-4xl mb-3">📚</div>
                                    <h4 className="text-lg font-medium mb-2">Entraide entre étudiants</h4>
                                    <p className="text-gray-600">Trouvez de l'aide auprès d'étudiants plus expérimentés.</p>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-md">
                                    <div className="text-red-600 text-4xl mb-3">🗓️</div>
                                    <h4 className="text-lg font-medium mb-2">Flexibilité</h4>
                                    <p className="text-gray-600">Planifiez des séances selon vos disponibilités.</p>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-md">
                                    <div className="text-red-600 text-4xl mb-3">🚀</div>
                                    <h4 className="text-lg font-medium mb-2">Progression rapide</h4>
                                    <p className="text-gray-600">Améliorez vos résultats grâce à un suivi personnalisé.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-4 text-center shadow-md">
                <h1 className="text-3xl md:text-4xl font-bold">INSA Tutoring</h1>
            </header>
            
            <main className="flex-grow py-10 px-4 md:px-0">
                {renderView()}
            </main>
            
            <footer className="bg-gray-800 text-white text-center py-4 mt-auto text-sm">
                <p>&copy; 2025 INSA Centre-Val de Loire - Plateforme de Tutorat</p>
            </footer>
        </div>
    );
}

export default App;