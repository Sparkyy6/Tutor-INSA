import React, { useState, useEffect } from 'react';
import './index.css';
import { registerUser } from './services/auth';
import { supabase } from './lib/supabase';
import Home from './components/Home';

function App() {
    const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'register'
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        year: '',
        departement: 'stpi', // Valeur par défaut
    });

    // Gestion dynamique du département en fonction de l'année
    useEffect(() => {
        // Si l'année est 1, forcer le département à STPI
        if (formData.year === '1' && formData.departement !== 'stpi') {
            setFormData(prev => ({ ...prev, departement: 'stpi' }));
        }
        // Si l'année est >= 2, et le département est STPI, changer pour GSI par défaut
        else if (
            formData.year !== '' && 
            parseInt(formData.year) >= 2 && 
            formData.departement === 'stpi'
        ) {
            setFormData(prev => ({ ...prev, departement: 'gsi' }));
        }
    }, [formData.year]);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Vérifier les identifiants dans la base de données
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', formData.email)
                .eq('password', formData.password) // En production, utiliser un hash
                .single();

            if (error || !user) {
                alert('Email ou mot de passe incorrect');
                return;
            }

            // Connexion réussie
            setCurrentUser(user);
            setIsLoggedIn(true);
            
            // Réinitialiser le formulaire
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                name: '',
                year: '',
                departement: 'stpi',
            });

        } catch (error: any) {
            alert('Erreur lors de la connexion');
            console.error('Login error:', error);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            alert("Les mots de passe ne correspondent pas!");
            return;
        }
        
        try {
            // Enregistrer uniquement l'utilisateur de base
            await registerUser({
                user: {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    year: formData.year ? Number(formData.year) : undefined,
                    departement: formData.departement
                },
                isStudent: false,
                isTutor: false
            });
            
            alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            setCurrentView('login');
        } catch (error: any) {
            alert(error.message || 'Erreur lors de l\'inscription');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setCurrentView('home');
    };

    // Si l'utilisateur est connecté, afficher la page d'accueil
    if (isLoggedIn && currentUser) {
        return <Home user={currentUser} onLogout={handleLogout} />;
    }

    const renderView = () => {
        switch(currentView) {
            case 'login':
                return (
                    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Connexion</h2>
                        <form onSubmit={handleLogin}>
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
                            <span>Vous n'avez pas de compte ?</span>
                            <button
                                onClick={() => setCurrentView('register')}
                                className="text-red-600 hover:text-red-700 font-medium underline ml-2 focus:outline-none"
                            >
                                S'inscrire
                            </button>
                        </div>
                        
                        <div className="text-center mt-4 text-sm text-gray-600">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="text-red-600 hover:text-red-700 font-medium underline focus:outline-none"
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
                        <form onSubmit={handleRegister}>
                            {/* Informations personnelles de base */}
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

                            {/* Informations sur le cursus */}
                            <div className="mb-4">
                                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Année d'étude</label>
                                <select
                                    id="year"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Sélectionner une année</option>
                                    <option value="1">1ère année</option>
                                    <option value="2">2ème année</option>
                                    <option value="3">3ème année</option>
                                    <option value="4">4ème année</option>
                                    <option value="5">5ème année</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="departement" className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                                <select
                                    id="departement"
                                    name="departement"
                                    value={formData.departement}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                    disabled={formData.year === '1' || formData.year === ''} // Désactivé si 1ère année ou pas d'année sélectionnée
                                >
                                    {formData.year === '1' && (
                                      <option value="stpi">STPI - Sciences et Techniques Pour l'Ingénieur</option>
                                    )}
                                    
                                    {formData.year !== '' && parseInt(formData.year) >= 2 && (
                                      <>
                                        <option value="gsi">GSI - Génie des Systèmes Industriels</option>
                                        <option value="sti">STI - Sécurité et Technologies Informatiques</option>
                                        <option value="mri">MRI - Maîtrise des Risques Industriels</option>
                                      </>
                                    )}
                                </select>
                                {formData.year === '1' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Les étudiants de 1ère année sont automatiquement affectés au département STPI.
                                    </p>
                                )}
                                {formData.year !== '' && parseInt(formData.year) >= 2 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Les étudiants de 2ème année et plus ne peuvent pas être en STPI.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out mt-6"
                            >
                                S'inscrire
                            </button>
                        </form>
                        
                        <div className="text-center mt-6 text-sm text-gray-600">
                            <span>Déjà inscrit ?</span>
                            <button
                                onClick={() => setCurrentView('login')}
                                className="text-red-600 hover:text-red-700 font-medium underline ml-2 focus:outline-none"
                            >
                                Se connecter
                            </button>
                        </div>
                        
                        <div className="text-center mt-4 text-sm text-gray-600">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="text-red-600 hover:text-red-700 font-medium underline focus:outline-none"
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
                        
                        {/* Section avantages */}
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