import React, { useState } from 'react';
import { createSessionRequest } from '../services/sessions';

interface SessionRequestButtonProps {
  conversationId: string;
  senderId: string;
  receiverId: string;
  subject: string;
  onRequestSent: () => void;
}

export default function SessionRequestButton({
  conversationId,
  senderId,
  receiverId,
  subject,
  onRequestSent
}: SessionRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time) {
      setError('Veuillez sélectionner une date et une heure');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Combiner date et heure
      const dateTime = new Date(`${date}T${time}`);
      
      await createSessionRequest({
        conversationId,
        senderId,
        receiverId,
        subject,
        date: dateTime,
        duration
      });
      
      // Fermer le dropdown et notifier le parent
      setIsOpen(false);
      onRequestSent();
    } catch (err) {
      setError('Erreur lors de la création de la demande');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <span className="mr-2">📅</span>
        Fixer un rendez-vous
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-10">
          <h3 className="font-medium text-gray-800 mb-3">Proposer un rendez-vous</h3>
          
          {error && (
            <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 heure</option>
                <option value={90}>1h30</option>
                <option value={120}>2 heures</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}