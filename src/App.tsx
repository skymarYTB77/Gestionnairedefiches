import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
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
      if (user) {
        // Subscribe to favorites
        const favoritesRef = collection(db, 'favorites');
        const q = query(favoritesRef, where('userId', '==', user.uid));
        
        const unsubscribeFavorites = onSnapshot(q, (snapshot) => {
          const favs = snapshot.docs.map(doc => doc.data().appId);
          setFavorites(favs);
        });

        return () => {
          unsubscribeFavorites();
        };
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAppClick = (appId: string) => {
    setActiveApp(prev => prev === appId ? null : appId);
  };

  const handleToggleFavorite = async (appId: string) => {
    if (!auth.currentUser) return;

    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef, 
      where('userId', '==', auth.currentUser.uid),
      where('appId', '==', appId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Add to favorites
      await addDoc(favoritesRef, {
        userId: auth.currentUser.uid,
        appId,
        createdAt: new Date()
      });
    } else {
      // Remove from favorites
      const docToDelete = querySnapshot.docs[0];
      await deleteDoc(docToDelete.ref);
    }
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