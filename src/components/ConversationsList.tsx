import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserConversations } from '../services/chat';

interface ConversationPreview {
  id: string;
  subject: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function ConversationsList() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    getUserConversations(user.id)
      .then(setConversations)
      .catch(err => console.error('Error fetching conversations:', err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center text-red-600 hover:text-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Retour à l'accueil
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Messagerie</h1>
        </div>
      </header>

      <main className="flex-grow py-6 px-4 md:px-0">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Vos conversations</h2>
            </div>
            
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Aucune conversation pour le moment.</p>
                <Link to="/find-tutor" className="mt-2 inline-block text-red-600 hover:text-red-700">
                  Chercher un tuteur
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {conversations.map(conversation => (
                  <li key={conversation.id}>
                    <Link to={`/chat/${conversation.id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            {conversation.subject}
                            {conversation.unread_count > 0 && (
                              <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {conversation.unread_count}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 truncate">avec {conversation.other_user_name}</p>
                          <p className="mt-1 text-sm text-gray-600 truncate">{conversation.last_message}</p>
                        </div>
                        <div className="ml-4">
                          <p className="text-xs text-gray-400">{conversation.last_message_time}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white text-center py-4 text-sm">
        <p>&copy; 2025 INSA Centre-Val de Loire - Plateforme de Tutorat</p>
      </footer>
    </div>
  );
}