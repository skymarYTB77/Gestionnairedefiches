import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { auth } from '../lib/firebase';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  width?: string;
  height?: string;
}

export function AppModal({ isOpen, onClose, title, url, width = '800px', height = '600px' }: AppModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = async (event: MessageEvent) => {
      // Vérifier si le message vient de l'une de nos applications
      if (event.origin !== 'https://gestionnairedetaches.netlify.app' && 
          event.origin !== 'https://signets.netlify.app') {
        return;
      }

      // Gérer la demande de vérification d'authentification
      if (event.data.type === 'CHECK_AUTH') {
        const token = await auth.currentUser?.getIdToken();
        if (event.source && 'postMessage' in event.source) {
          (event.source as Window).postMessage({
            type: 'AUTH_STATUS',
            token
          }, event.origin);
        }
      }
    };

    // Ajouter l'écouteur d'événements
    window.addEventListener('message', handleMessage);

    // Envoyer le token initial
    const sendInitialToken = async () => {
      if (iframeRef.current?.contentWindow && auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          iframeRef.current.contentWindow.postMessage({
            type: 'FIREBASE_TOKEN',
            token
          }, new URL(url).origin);
        } catch (error) {
          console.error('Erreur lors de l\'envoi du token:', error);
        }
      }
    };

    // Envoyer le token après le chargement de l'iframe
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = sendInitialToken;
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe) {
        iframe.onload = null;
      }
    };
  }, [isOpen, url]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gray-800 rounded-lg shadow-xl flex flex-col max-w-[95vw] max-h-[95vh]" 
        style={{ width, height }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 relative bg-white rounded-b-lg overflow-hidden">
          <iframe
            ref={iframeRef}
            src={url}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </div>
  );
}