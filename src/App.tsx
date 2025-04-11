import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { LoginPage } from './components/LoginPage';
import MainApp from './components/MainApp';
import { Sidebar } from './components/Sidebar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

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
      />
    </div>
  ) : (
    <LoginPage />
  );
}

export default App;