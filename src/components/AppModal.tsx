import React, { useEffect, useRef, useState } from 'react';
import { X, Minus, ExternalLink } from 'lucide-react';
import { auth } from '../lib/firebase';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  url: string;
  title: string;
  zIndex: number;
  onFocus: () => void;
}

export function AppModal({ isOpen, onClose, onMinimize, url, title, zIndex, onFocus }: AppModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialPosition: { x: 0, y: 0 }
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== 'https://gestionnairedetaches.netlify.app' && 
          event.origin !== 'https://signets.netlify.app' &&
          event.origin !== 'https://generateur-identite.netlify.app') {
        return;
      }

      if (event.data.type === 'CHECK_AUTH') {
        const token = await auth.currentUser?.getIdToken();
        if (event.source && 'postMessage' in event.source) {
          (event.source as Window).postMessage({
            type: 'AUTH_STATUS',
            token,
            uid: auth.currentUser?.uid
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
            token,
            uid: auth.currentUser.uid
          }, new URL(url).origin);
        } catch (error) {
          console.error('Erreur lors de l\'envoi du token:', error);
        }
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        sendInitialToken();
        setIsLoading(false);
      };
    }

    // Center the window initially
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - 800) / 2,
        y: (window.innerHeight - 600) / 2
      });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe) {
        iframe.onload = null;
      }
    };
  }, [isOpen, url]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!headerRef.current?.contains(e.target as Node)) return;
    
    e.preventDefault();
    onFocus();

    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialPosition: position
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.current.isDragging) return;

    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;

    setPosition({
      x: dragState.current.initialPosition.x + deltaX,
      y: dragState.current.initialPosition.y + deltaY
    });
  };

  const handleMouseUp = () => {
    dragState.current.isDragging = false;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-transparent"
      style={{ zIndex }}
      onClick={onFocus}
    >
      <div 
        ref={modalRef}
        className="absolute"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: '800px',
          height: '600px'
        }}
      >
        <div 
          ref={headerRef}
          className="absolute top-0 left-0 right-0 h-10 bg-gray-800 cursor-move z-10 select-none rounded-t-lg flex items-center px-4"
          onMouseDown={handleMouseDown}
        >
          <span className="text-white/80 flex-1 text-sm">{title}</span>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-all"
              aria-label="Ouvrir dans un nouvel onglet"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={onMinimize}
              className="text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-all"
              aria-label="Réduire"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-all"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="w-full h-full bg-[#1a1b1e] rounded-lg shadow-xl overflow-hidden" style={{ paddingTop: '40px' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full"
            style={{ 
              border: 'none',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
}