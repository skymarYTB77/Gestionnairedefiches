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

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  initialPosition: Position;
}

export function AppModal({ isOpen, onClose, onMinimize, url, title, zIndex, onFocus }: AppModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const dragState = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialPosition: { x: 0, y: 0 }
  });

  const DEAD_ZONE_SIZE = 20;

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
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe) {
        iframe.onload = null;
      }
    };
  }, [isOpen, url]);

  const isInControlsDeadZone = (x: number, y: number): boolean => {
    if (!headerRef.current) return false;
    
    const controls = headerRef.current.querySelector('.window-controls');
    if (!controls) return false;

    const rect = controls.getBoundingClientRect();
    return (
      x >= rect.left - DEAD_ZONE_SIZE &&
      x <= rect.right + DEAD_ZONE_SIZE &&
      y >= rect.top - DEAD_ZONE_SIZE &&
      y <= rect.bottom + DEAD_ZONE_SIZE
    );
  };

  const keepInBounds = (pos: Position): Position => {
    if (!modalRef.current) return pos;

    const rect = modalRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    return {
      x: Math.max(0, Math.min(pos.x, maxX)),
      y: Math.max(0, Math.min(pos.y, maxY))
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onFocus();

    if (!headerRef.current?.contains(e.target as Node) || 
        (e.target as HTMLElement).closest('.window-controls')) {
      return;
    }

    const rect = modalRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialPosition: position
    };

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.current.isDragging) return;

    if (isInControlsDeadZone(e.clientX, e.clientY)) {
      dragState.current.isDragging = false;
      return;
    }

    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;

    const newPosition = keepInBounds({
      x: dragState.current.initialPosition.x + deltaX,
      y: dragState.current.initialPosition.y + deltaY
    });

    setPosition(newPosition);
  };

  const handleMouseUp = () => {
    if (dragState.current.isDragging) {
      dragState.current.isDragging = false;
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
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

  const isBookmarksApp = url === 'https://signets.netlify.app/';
  const isIdentityApp = url === 'https://generateur-identite.netlify.app/';

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
          width: '100%',
          maxWidth: '800px',
          height: '600px',
          maxHeight: '80vh'
        }}
      >
        <div 
          ref={headerRef}
          className="absolute top-0 left-0 right-0 h-10 bg-gray-800 cursor-move z-10 select-none rounded-t-lg flex items-center px-4"
          onMouseDown={handleMouseDown}
        >
          <span className="text-white/80 flex-1 text-sm">{title}</span>
          <div className="window-controls flex items-center gap-2">
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
              pointerEvents: dragState.current.isDragging ? 'none' : 'auto',
              transform: isIdentityApp ? 'scale(0.75)' : 'none',
              transformOrigin: 'top center',
              height: isIdentityApp ? 'calc(100% + 120px)' : '100%',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </div>
  );
}