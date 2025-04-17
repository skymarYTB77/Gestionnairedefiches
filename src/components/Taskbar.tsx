import React from 'react';
import { CheckSquare, Bookmark, UserSquare2 } from 'lucide-react';

interface TaskbarProps {
  minimizedApps: {
    id: string;
    title: string;
    type: 'tasks' | 'bookmarks' | 'identity';
  }[];
  onRestore: (id: string) => void;
}

export function Taskbar({ minimizedApps, onRestore }: TaskbarProps) {
  if (minimizedApps.length === 0) return null;

  const getIcon = (type: 'tasks' | 'bookmarks' | 'identity') => {
    switch (type) {
      case 'tasks':
        return <CheckSquare size={16} />;
      case 'bookmarks':
        return <Bookmark size={16} />;
      case 'identity':
        return <UserSquare2 size={16} />;
    }
  };

  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg border border-gray-700" style={{ maxWidth: 'calc(100% - 500px)' }}>
      {minimizedApps.map((app) => (
        <button
          key={app.id}
          onClick={() => onRestore(app.id)}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700/50 transition-colors text-white/80 hover:text-white"
          title={app.title}
        >
          {getIcon(app.type)}
          <span className="text-sm">{app.title}</span>
        </button>
      ))}
    </div>
  );
}