import React from 'react';
import { Bookmark, CheckSquare, UserSquare2 } from 'lucide-react';

interface AppDockProps {
  activeApp: string | null;
  onAppClick: (appId: string) => void;
  favorites: string[];
  onToggleFavorite: (appId: string) => void;
}

export function AppDock({ activeApp, onAppClick, favorites, onToggleFavorite }: AppDockProps) {
  const apps = [
    { id: 'bookmarks', icon: Bookmark, label: 'Signets', canBeFavorited: false },
    { id: 'tasks', icon: CheckSquare, label: 'Tâches', canBeFavorited: false }
  ];

  const favoritedApps = [
    { id: 'identity', icon: UserSquare2, label: 'Générateur d\'identité', canBeFavorited: true }
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg border border-gray-700 flex items-center gap-4">
      <div className="flex items-center gap-2">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => onAppClick(app.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700/50 transition-colors ${
              activeApp === app.id ? 'text-blue-400 bg-blue-500/10' : 'text-white/80 hover:text-white'
            }`}
            title={app.label}
          >
            <app.icon size={20} />
            <span className="text-sm">{app.label}</span>
          </button>
        ))}
      </div>

      {favorites.length > 0 && (
        <>
          <div className="w-px h-6 bg-gray-700" />
          <div className="flex items-center gap-2">
            {favorites.map((appId) => {
              const app = favoritedApps.find(a => a.id === appId);
              if (!app) return null;
              
              return (
                <button
                  key={app.id}
                  onClick={() => onAppClick(app.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700/50 transition-colors ${
                    activeApp === app.id ? 'text-blue-400 bg-blue-500/10' : 'text-white/80 hover:text-white'
                  }`}
                  title={app.label}
                >
                  <app.icon size={20} />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}