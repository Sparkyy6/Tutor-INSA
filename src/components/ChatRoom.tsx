import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMessages, sendMessage, getConversationDetails } from '../services/chat';
import { getSessionsForConversation } from '../services/sessions';
import { Message } from '../types/chat.types';
import { supabase } from '../lib/supabase';
import SessionRequestButton from './SessionRequestButton';
import SessionRequestItem from './SessionRequestItem';

export default function ChatRoom() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationDetails, setConversationDetails] = useState<{
    subject: string, 
    otherUserName: string, 
    otherUserId: string
  } | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fonction pour charger les sessions
  const loadSessions = useCallback(async () => {
    if (!conversationId) return;
    console.log('Loading sessions for conversation:', conversationId);
    try {
      const sessionData = await getSessionsForConversation(conversationId);
      console.log('Sessions loaded:', sessionData);
      setSessions(sessionData);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !user?.id) return;
    
    // Charger les messages initiaux et les sessions
    setLoading(true);
    Promise.all([
      getMessages(conversationId),
      getConversationDetails(conversationId, user.id),
      getSessionsForConversation(conversationId)
    ]).then(([messagesData, details, sessionData]) => {
      setMessages(messagesData);
      setConversationDetails(details);
      setSessions(sessionData);
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
    
    // Configurer l'abonnement global aux changements de sessions
    // Sans filtre sur conversation_id qui n'existe pas dans la table session
    const sessionSubscription = supabase
      .channel(`session-changes-${conversationId}`)
      .on('postgres_changes', {
        event: '*',  // Écouter tous les types d'événements (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'session'
        // Pas de filtre car conversation_id n'existe pas
      }, (payload) => {
        console.log('Session change detected:', payload);
        // Recharger toutes les sessions à chaque changement
        loadSessions();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
      sessionSubscription.unsubscribe();
    };
  }, [conversationId, user?.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !conversationId) return;
    await sendMessage(conversationId, user.id, input.trim());
    setInput('');
  };

  const handleSessionRequestSent = async () => {
    // Recharger les sessions après l'envoi d'une demande
    await loadSessions();
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
          {/* Section des sessions/rendez-vous */}
          {user && conversationDetails?.otherUserId && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-gray-900">Rendez-vous</h2>
                <SessionRequestButton
                  conversationId={conversationId || ''}
                  senderId={user.id}
                  receiverId={conversationDetails.otherUserId}
                  subject={conversationDetails.subject}
                  onRequestSent={handleSessionRequestSent}
                />
              </div>
              
              {sessions.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {sessions.map(session => {
                    // L'utilisateur est le créateur si c'est lui qui a envoyé la demande
                    const isCreator = user.id === conversationDetails?.otherUserId;

                    return (
                      <SessionRequestItem
                        key={session.id}
                        sessionId={session.id}
                        conversationId={conversationId || ''}
                        userId={user.id}
                        date={session.date}
                        duration={session.duree}
                        status={session.statue || 'attente'}
                        isCreator={isCreator}
                        // Passer une prop supplémentaire pour indiquer si c'est l'envoyeur
                        isSender={isCreator}
                        onResponse={loadSessions}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4">Aucun rendez-vous planifié.</p>
              )}
            </div>
          )}

          {/* Fenêtre de chat */}
          <div className="bg-white rounded-lg shadow-md h-[65vh] flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Aucun message. Commencez la conversation !
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <div className="flex-shrink-0 mr-2">
                              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold shadow">
                                {conversationDetails?.otherUserName?.[0] || "?"}
                              </div>
                            </div>
                          )}
                          <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow
                            ${isMe
                              ? 'bg-gradient-to-br from-red-500 to-red-400 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`
                          }
                          >
                            <div className="whitespace-pre-line break-words">{msg.content}</div>
                            <div className={`text-xs mt-1 ${isMe ? 'text-red-100' : 'text-gray-400'} text-right`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {isMe && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold shadow">
                                {user?.name?.[0] || "M"}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form
                  onSubmit={handleSend}
                  className="border-t p-4 flex gap-2 bg-gray-50 sticky bottom-0"
                  style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.03)' }}
                >
                  <input
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-red-500 bg-white shadow-sm"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Votre message..."
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`px-6 py-2 rounded-full font-semibold transition
                      ${input.trim()
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`
                    }
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