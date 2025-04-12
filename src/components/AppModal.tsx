import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { DndContext, DragEndEvent, useDraggable } from '@dnd-kit/core';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

function DraggableWindow({ children, id }: { children: React.ReactNode; id: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="cursor-move"
      {...listeners} 
      {...attributes}
    >
      {children}
    </div>
  );
}

export function AppModal({ isOpen, onClose, url }: AppModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

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

  const isBookmarksApp = url === 'https://signets.netlify.app/';

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPosition(prev => ({
      x: prev.x + (delta?.x || 0),
      y: prev.y + (delta?.y || 0),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <DndContext onDragEnd={handleDragEnd}>
        <div 
          className="absolute inset-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <DraggableWindow id="modal-window">
              <div className={`relative bg-transparent rounded-lg overflow-hidden ${isBookmarksApp ? 'w-[800px] h-[600px]' : ''}`}>
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
                  className={`${isBookmarksApp ? 'w-full h-full' : 'w-[800px] h-[600px]'} bg-[#1a1b1e] rounded-lg shadow-xl`}
                  style={{ 
                    border: 'none',
                    transform: isBookmarksApp ? 'none' : 'scale(0.9)',
                    transformOrigin: 'center center',
                    pointerEvents: 'auto'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            </DraggableWindow>
          </div>
        </div>
      </DndContext>
    </div>
  );
}