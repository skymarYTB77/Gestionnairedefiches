import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { auth } from '../lib/firebase';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export function AppModal({ isOpen, onClose, url }: AppModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== 'https://gestionnairedetaches.netlify.app' && 
          event.origin !== 'https://signets.netlify.app') {
        return;
      }

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

    window.addEventListener('message', handleMessage);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-transparent rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-all"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
        <iframe
          ref={iframeRef}
          src={url}
          className="w-[800px] h-[600px] bg-[#1a1b1e] rounded-lg shadow-xl"
          style={{ 
            border: 'none',
            transform: 'scale(0.9)',
            transformOrigin: 'center center'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}