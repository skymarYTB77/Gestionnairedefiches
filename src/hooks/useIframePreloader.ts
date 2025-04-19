import { useState, useEffect } from 'react';

interface PreloadState {
  [key: string]: boolean;
}

export function useIframePreloader(favorites: string[]) {
  const [preloadedStates, setPreloadedStates] = useState<PreloadState>({});
  const [isPreloading, setIsPreloading] = useState(true);

  useEffect(() => {
    const preloadIframes = async () => {
      setIsPreloading(true);
      const states: PreloadState = {};

      // Précharger d'abord les favoris
      for (const appId of favorites) {
        states[appId] = true;
      }

      // Précharger les autres applications en arrière-plan
      const otherApps = ['tasks', 'bookmarks', 'identity'].filter(
        app => !favorites.includes(app)
      );

      for (const appId of otherApps) {
        states[appId] = true;
      }

      setPreloadedStates(states);
      setIsPreloading(false);
    };

    preloadIframes();
  }, [favorites]);

  return {
    preloadedStates,
    isPreloading
  };
}