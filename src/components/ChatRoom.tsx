import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMessages, sendMessage } from '../services/chat';
import { Message } from '../types/chat.types';
import { supabase } from '../lib/supabase';

export default function ChatRoom() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    
    // Charger les messages initiaux
    setLoading(true);
    getMessages(conversationId)
      .then(setMessages)
      .finally(() => setLoading(false));
      
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
  }, [conversationId]);

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

  if (loading) return <div>Chargement...</div>;
  if (!conversationId) return <div>Conversation introuvable</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded shadow p-4 flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${msg.sender_id === user?.id ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
              {msg.content}
            </span>
            <div className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Votre message..."
        />
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">Envoyer</button>
      </form>
    </div>
  );
}