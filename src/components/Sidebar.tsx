import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Plus,
  FileText,
  Settings,
  Download,
  Upload,
  Clock,
  Star,
  Users,
  CheckSquare,
  Bookmark,
  UserSquare2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { AppModal } from './AppModal';
import { Taskbar } from './Taskbar';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onModalOpen: () => void;
  onModalClose: () => void;
  onToggleFavorite: (appId: string) => void;
  favorites: string[];
}

interface AppWindow {
  id: string;
  type: 'tasks' | 'bookmarks' | 'identity';
  title: string;
  url: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  canBeFavorited?: boolean;
}

const ALL_APPS = [
  {
    id: 'tasks',
    type: 'tasks',
    title: 'Gestionnaire de tâches',
    url: 'https://gestionnairedetaches.netlify.app/',
    icon: CheckSquare,
    canBeFavorited: false
  },
  {
    id: 'bookmarks',
    type: 'bookmarks',
    title: 'Signets',
    url: 'https://signets.netlify.app/',
    icon: Bookmark,
    canBeFavorited: false
  },
  {
    id: 'identity',
    type: 'identity',
    title: 'Générateur d\'identité',
    url: 'https://generateur-identite.netlify.app/',
    icon: UserSquare2,
    canBeFavorited: true
  }
];

export function Sidebar({ isOpen, onToggle, onModalOpen, onModalClose, onToggleFavorite, favorites }: SidebarProps) {
  const { visibleData, acceptedData, rejectedData } = useSelector(
    (state: RootState) => state.restaurants
  );

  const [windows, setWindows] = useState<AppWindow[]>(ALL_APPS.map(app => ({
    ...app,
    isOpen: false,
    isMinimized: false,
    zIndex: 50
  })));

  const handleOpenWindow = (id: string) => {
    setWindows(prev => prev.map(window => {
      if (window.id === id) {
        return { ...window, isOpen: true, isMinimized: false, zIndex: Math.max(...prev.map(w => w.zIndex)) + 1 };
      }
      return window;
    }));
    onModalOpen();
  };

  const handleCloseWindow = (id: string) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, isOpen: false, isMinimized: false } : window
    ));
    if (!windows.some(w => w.isOpen && w.id !== id)) {
      onModalClose();
    }
  };

  const handleMinimizeWindow = (id: string) => {
    setWindows(prev => prev.map(window =>
      window.id === id ? { ...window, isMinimized: true } : window
    ));
  };

  const handleRestoreWindow = (id: string) => {
    setWindows(prev => prev.map(window => {
      if (window.id === id) {
        return { ...window, isMinimized: false, zIndex: Math.max(...prev.map(w => w.zIndex)) + 1 };
      }
      return window;
    }));
  };

  const handleFocusWindow = (id: string) => {
    setWindows(prev => prev.map(window => {
      if (window.id === id) {
        return { ...window, zIndex: Math.max(...prev.map(w => w.zIndex)) + 1 };
      }
      return window;
    }));
  };

  const minimizedApps = windows.filter(w => w.isMinimized).map(w => ({
    id: w.id,
    title: w.title,
    type: w.type
  }));

  return (
    <>
      <button 
        className={`sidebar-toggle ${!isOpen ? 'closed' : ''}`}
        onClick={onToggle}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className={`sidebar ${!isOpen ? 'closed' : ''}`}>
        <div className="sidebar-section">
          <h3>Statistiques</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{visibleData.length}</div>
              <div className="stat-label">En attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{acceptedData.length}</div>
              <div className="stat-label">Acceptées</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{rejectedData.length}</div>
              <div className="stat-label">Rejetées</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {visibleData.length + acceptedData.length + rejectedData.length}
              </div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Applications</h3>
          <div className="quick-actions">
            {ALL_APPS.map(app => (
              <button 
                key={app.id}
                className="quick-action-button group relative"
                onClick={() => handleOpenWindow(app.id)}
              >
                <app.icon size={16} />
                <span>{app.title}</span>
                {app.canBeFavorited && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(app.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 absolute right-2 text-yellow-400 hover:text-yellow-300 transition-opacity"
                  >
                    <Star size={16} fill={favorites.includes(app.id) ? 'currentColor' : 'none'} />
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {windows.map(window => (
        <AppModal
          key={window.id}
          isOpen={window.isOpen && !window.isMinimized}
          onClose={() => handleCloseWindow(window.id)}
          onMinimize={() => handleMinimizeWindow(window.id)}
          url={window.url}
          title={window.title}
          zIndex={window.zIndex}
          onFocus={() => handleFocusWindow(window.id)}
        />
      ))}

      <Taskbar
        minimizedApps={minimizedApps}
        onRestore={handleRestoreWindow}
      />
    </>
  );
}