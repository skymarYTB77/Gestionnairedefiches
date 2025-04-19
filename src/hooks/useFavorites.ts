import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface Favorite {
  id: string;
  type: 'tasks' | 'bookmarks' | 'identity';
  order: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const favoritesRef = collection(db, 'favorites');
    const userFavoritesQuery = query(
      favoritesRef,
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(userFavoritesQuery, 
      (snapshot) => {
        const favs = snapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id } as Favorite))
          .sort((a, b) => a.order - b.order);
        setFavorites(favs);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching favorites:', err);
        setError('Erreur lors de la récupération des favoris');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addFavorite = async (type: 'tasks' | 'bookmarks' | 'identity') => {
    if (!auth.currentUser) return;

    try {
      const favoritesRef = collection(db, 'favorites');
      const newFavorite = {
        type,
        userId: auth.currentUser.uid,
        order: favorites.length,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(favoritesRef), newFavorite);
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError('Erreur lors de l\'ajout du favori');
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const favoriteRef = doc(db, 'favorites', id);
      await deleteDoc(favoriteRef);
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Erreur lors de la suppression du favori');
    }
  };

  const reorderFavorites = async (newOrder: Favorite[]) => {
    try {
      const batch = newOrder.map((fav, index) => 
        setDoc(doc(db, 'favorites', fav.id), { order: index }, { merge: true })
      );
      await Promise.all(batch);
    } catch (err) {
      console.error('Error reordering favorites:', err);
      setError('Erreur lors de la réorganisation des favoris');
    }
  };

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    reorderFavorites
  };
}