import React from 'react';
import { CheckSquare, Bookmark } from 'lucide-react';

interface TaskbarProps {
  minimizedApps: {
    id: string;
    title: string;
    type: 'tasks' | 'bookmarks';
  }[];
  onRestore: (id: string) => void;
}

export function Taskbar({ minimizedApps, onRestore }: TaskbarProps) {
  if (minimizedApps.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg border border-gray-700">
      {minimizedApps.map((app) => (
        <button
          key={app.id}
          onClick={() => onRestore(app.id)}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700/50 transition-colors text-white/80 hover:text-white"
          title={app.title}
        >
          {app.type === 'tasks' ? (
            <CheckSquare size={16} />
          ) : (
            <Bookmark size={16} />
          )}
          <span className="text-sm">{app.title}</span>
        </button>
      ))}
    </div>
  );
}