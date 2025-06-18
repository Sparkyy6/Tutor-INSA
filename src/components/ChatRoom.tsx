import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMessages, sendMessage, getConversationDetails } from '../services/chat';
import { Message } from '../types/chat.types';
import { supabase } from '../lib/supabase';

export default function ChatRoom() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationDetails, setConversationDetails] = useState<{subject: string, otherUserName: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId || !user?.id) return;
    
    // Charger les messages initiaux
    setLoading(true);
    Promise.all([
      getMessages(conversationId),
      getConversationDetails(conversationId, user.id)
    ]).then(([messagesData, details]) => {
      setMessages(messagesData);
      setConversationDetails(details);
    }).finally(() => setLoading(false));
      
    // Configurer l'abonnement aux nouveaux messages
    const subscription = supabase
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'message',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, user?.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !conversationId) return;
    const msg = await sendMessage(conversationId, user.id, input.trim());
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-red-600 hover:text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Retour à l'accueil
            </Link>
            <Link to="/conversations" className="flex items-center text-blue-600 hover:text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" transform="rotate(180 10 10)" />
              </svg>
              Retour à la messagerie
            </Link>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            {conversationDetails?.subject ? `Discussion: ${conversationDetails.subject}` : 'Conversation'}
            {conversationDetails?.otherUserName ? ` avec ${conversationDetails.otherUserName}` : ''}
          </h1>
        </div>
      </header>
      
      <main className="flex-grow py-6 px-4 md:px-0">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-lg shadow-md h-[65vh] flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Aucun message. Commencez la conversation !
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`mb-2 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block px-3 py-2 rounded-lg ${msg.sender_id === user?.id ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {msg.content}
                        </span>
                        <div className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
                  <input
                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:border-red-500"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Votre message..."
                    autoComplete="off"
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim()}
                    className={`px-4 py-2 rounded font-medium ${input.trim() ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  >
                    Envoyer
                  </button>
                </form>
              </>
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