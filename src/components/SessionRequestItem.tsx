import { useState } from 'react';
import { respondToSessionRequest } from '../services/sessions';

interface SessionRequestItemProps {
  sessionId: string;
  conversationId: string;
  userId: string;
  date: string;
  duration: number;
  status: 'attente' | 'oui' | 'non';
  isCreator: boolean;
  isSender: boolean;
  onResponse: () => void;
}

export default function SessionRequestItem({
  sessionId,
  conversationId,
  userId,
  date,
  duration,
  status,
  isCreator,
  onResponse
}: SessionRequestItemProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleResponse = async (accepted: boolean) => {
    try {
      setIsSubmitting(true);
      await respondToSessionRequest(sessionId, conversationId, userId, accepted);
      onResponse();
    } catch (error) {
      console.error('Error responding to session request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage en fonction du statut
  let statusDisplay;
  if (status === 'attente') {
    statusDisplay = (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        En attente
      </span>
    );
  } else if (status === 'oui') {
    statusDisplay = (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Accepté
      </span>
    );
  } else {
    statusDisplay = (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Refusé
      </span>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-800">Rendez-vous</h4>
          <div className="text-sm text-gray-600 my-1">
            <span className="font-medium">Date:</span> {formatDate(date)}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Durée:</span> {duration} minutes
          </div>
        </div>
        <div>{statusDisplay}</div>
      </div>

      {/* Actions disponibles en fonction du statut et du rôle */}
      {status === 'attente' && (
        <div className="flex space-x-2 mt-3">
          {!isCreator && (
            <>
              {/* Boutons pour le destinataire (celui qui reçoit la demande) */}
              <button
                onClick={() => handleResponse(true)}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 px-3 rounded transition-colors disabled:opacity-50"
              >
                Accepter
              </button>
              <button
                onClick={() => handleResponse(false)}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-1.5 px-3 rounded transition-colors disabled:opacity-50"
              >
                Refuser
              </button>
            </>
          )}
          {isCreator && (
            // Bouton uniquement pour annuler sa propre demande
            <button
              onClick={() => handleResponse(false)}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-1.5 px-3 rounded transition-colors disabled:opacity-50"
            >
              Annuler ma demande
            </button>
          )}
        </div>
      )}
    </div>
  );
}