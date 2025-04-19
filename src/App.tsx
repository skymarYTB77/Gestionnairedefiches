import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { LoginPage } from './components/LoginPage';
import MainApp from './components/MainApp';
import { Sidebar } from './components/Sidebar';
import { AppDock } from './components/AppDock';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleAppClick = (appId: string) => {
    setActiveApp(prev => prev === appId ? null : appId);
  };

  const handleToggleFavorite = (appId: string) => {
    setFavorites(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <div className={`app-wrapper ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      <MainApp 
        isSidebarOpen={isSidebarOpen} 
        isModalOpen={isModalOpen} 
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onModalOpen={() => setIsModalOpen(true)}
        onModalClose={() => setIsModalOpen(false)}
        onToggleFavorite={handleToggleFavorite}
        favorites={favorites}
      />
      <AppDock
        activeApp={activeApp}
        onAppClick={handleAppClick}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  ) : (
    <LoginPage />
  );
}

export default App;