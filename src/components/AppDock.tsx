import React, { useState } from 'react';
import { CheckSquare, Bookmark, UserSquare2 } from 'lucide-react';
import { AppModal } from './AppModal';
import { Taskbar } from './Taskbar';

interface AppDockProps {
  activeApp: string | null;
  onAppClick: (appId: string) => void;
  favorites: string[];
  onToggleFavorite: (appId: string) => void;
}

export function AppDock({ activeApp, onAppClick, favorites, onToggleFavorite }: AppDockProps) {
  const [windows, setWindows] = useState<{
    [key: string]: {
      isOpen: boolean;
      isMinimized: boolean;
      zIndex: number;
    };
  }>({
    tasks: { isOpen: false, isMinimized: false, zIndex: 50 },
    bookmarks: { isOpen: false, isMinimized: false, zIndex: 50 }
  });

  const apps = [
    { id: 'tasks', icon: CheckSquare, label: 'Tâches', url: 'https://gestionnairedetaches.netlify.app/' },
    { id: 'bookmarks', icon: Bookmark, label: 'Signets', url: 'https://signets.netlify.app/' },
    { id: 'identity', icon: UserSquare2, label: 'Générateur d\'identité', url: 'https://generateur-identite.netlify.app/' }
  ];

  const handleAppClick = (appId: string, url: string) => {
    if (appId === 'identity') {
      window.open(url, '_blank');
      return;
    }

    setWindows(prev => {
      const currentWindow = prev[appId];
      const maxZIndex = Math.max(...Object.values(prev).map(w => w.zIndex));

      if (!currentWindow?.isOpen) {
        // Ouvrir une nouvelle fenêtre
        return {
          ...prev,
          [appId]: {
            isOpen: true,
            isMinimized: false,
            zIndex: maxZIndex + 1
          }
        };
      } else if (currentWindow.isMinimized) {
        // Restaurer une fenêtre minimisée
        return {
          ...prev,
          [appId]: {
            ...currentWindow,
            isMinimized: false,
            zIndex: maxZIndex + 1
          }
        };
      } else {
        // Minimiser une fenêtre ouverte
        return {
          ...prev,
          [appId]: {
            ...currentWindow,
            isMinimized: true
          }
        };
      }
    });
    onAppClick(appId);
  };

  const handleCloseWindow = (appId: string) => {
    setWindows(prev => ({
      ...prev,
      [appId]: { ...prev[appId], isOpen: false }
    }));
  };

  const handleMinimizeWindow = (appId: string) => {
    setWindows(prev => ({
      ...prev,
      [appId]: { ...prev[appId], isMinimized: true }
    }));
  };

  const handleRestoreWindow = (appId: string) => {
    setWindows(prev => {
      const maxZIndex = Math.max(...Object.values(prev).map(w => w.zIndex));
      return {
        ...prev,
        [appId]: {
          ...prev[appId],
          isMinimized: false,
          zIndex: maxZIndex + 1
        }
      };
    });
  };

  const handleFocusWindow = (appId: string) => {
    setWindows(prev => {
      const maxZIndex = Math.max(...Object.values(prev).map(w => w.zIndex));
      return {
        ...prev,
        [appId]: {
          ...prev[appId],
          zIndex: maxZIndex + 1
        }
      };
    });
  };

  const minimizedApps = Object.entries(windows)
    .filter(([_, window]) => window.isOpen && window.isMinimized)
    .map(([id]) => {
      const app = apps.find(a => a.id === id);
      return {
        id,
        title: app?.label || '',
        type: app?.id as 'tasks' | 'bookmarks' | 'identity'
      };
    });

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg border border-gray-700 flex items-center gap-4">
        <div className="flex items-center gap-2">
          {apps.map((app) => {
            if (app.id === 'identity' && !favorites.includes(app.id)) {
              return null;
            }
            
            const isActive = windows[app.id]?.isOpen && !windows[app.id]?.isMinimized;
            
            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app.id, app.url)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700/50 transition-colors ${
                  isActive ? 'text-blue-400 bg-blue-500/10' : 'text-white/80 hover:text-white'
                }`}
                title={app.label}
              >
                <app.icon size={20} />
                {app.id !== 'identity' && <span className="text-sm">{app.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <Taskbar
        minimizedApps={minimizedApps}
        onRestore={handleRestoreWindow}
      />

      {apps.map(app => (
        app.id !== 'identity' && windows[app.id]?.isOpen && (
          <AppModal
            key={app.id}
            isOpen={windows[app.id].isOpen && !windows[app.id].isMinimized}
            onClose={() => handleCloseWindow(app.id)}
            onMinimize={() => handleMinimizeWindow(app.id)}
            url={app.url}
            title={app.label}
            zIndex={windows[app.id].zIndex}
            onFocus={() => handleFocusWindow(app.id)}
          />
        )
      ))}
    </>
  );
}