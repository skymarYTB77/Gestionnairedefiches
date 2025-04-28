import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, writeBatch, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Restaurant {
  id?: string;
  Nom: string;
  Étoiles: string;
  "Nombre d'Avis": string;
  Type: string;
  Adresse: string;
  Téléphone: string;
  "Lien Site Web": string;
  "Horaires d'ouverture"?: string;
  Classification?: string;
  Note?: string;
  status: 'visible' | 'accepted' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

interface RestaurantState {
  visibleData: Restaurant[];
  acceptedData: Restaurant[];
  rejectedData: Restaurant[];
  past: {
    visibleData: Restaurant[];
    acceptedData: Restaurant[];
    rejectedData: Restaurant[];
  }[];
  future: {
    visibleData: Restaurant[];
    acceptedData: Restaurant[];
    rejectedData: Restaurant[];
  }[];
  loading: boolean;
  error: string | null;
}

const initialState: RestaurantState = {
  visibleData: [],
  acceptedData: [],
  rejectedData: [],
  past: [],
  future: [],
  loading: false,
  error: null
};

const saveToHistory = (state: RestaurantState) => {
  state.past.push({
    visibleData: [...state.visibleData],
    acceptedData: [...state.acceptedData],
    rejectedData: [...state.rejectedData]
  });
  state.future = [];
};

// Helper function to convert Firestore timestamps to ISO strings
const convertTimestamps = (data: any): Restaurant => {
  const converted = { ...data };
  if (converted.createdAt?.toDate) {
    converted.createdAt = converted.createdAt.toDate().toISOString();
  }
  if (converted.updatedAt?.toDate) {
    converted.updatedAt = converted.updatedAt.toDate().toISOString();
  }
  return converted as Restaurant;
};

export const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setInitialData: (state, action: PayloadAction<{
      visible: any[];
      accepted: any[];
      rejected: any[];
    }>) => {
      state.visibleData = action.payload.visible.map(convertTimestamps);
      state.acceptedData = action.payload.accepted.map(convertTimestamps);
      state.rejectedData = action.payload.rejected.map(convertTimestamps);
    },
    addRestaurantSuccess: (state, action: PayloadAction<Restaurant>) => {
      saveToHistory(state);
      state.visibleData.push(convertTimestamps(action.payload));
    },
    deleteRestaurantSuccess: (state, action: PayloadAction<{ id: string; database: 'visible' | 'accepted' | 'rejected' }>) => {
      saveToHistory(state);
      const { id, database } = action.payload;
      if (database === 'visible') {
        state.visibleData = state.visibleData.filter(r => r.id !== id);
      } else if (database === 'accepted') {
        state.acceptedData = state.acceptedData.filter(r => r.id !== id);
      } else {
        state.rejectedData = state.rejectedData.filter(r => r.id !== id);
      }
    },
    moveRestaurantSuccess: (state, action: PayloadAction<{
      restaurant: any;
      fromStatus: 'visible' | 'accepted' | 'rejected';
      toStatus: 'visible' | 'accepted' | 'rejected';
    }>) => {
      saveToHistory(state);
      const { restaurant, fromStatus, toStatus } = action.payload;
      const convertedRestaurant = convertTimestamps(restaurant);
      
      if (fromStatus === 'visible') {
        state.visibleData = state.visibleData.filter(r => r.id !== restaurant.id);
      } else if (fromStatus === 'accepted') {
        state.acceptedData = state.acceptedData.filter(r => r.id !== restaurant.id);
      } else {
        state.rejectedData = state.rejectedData.filter(r => r.id !== restaurant.id);
      }

      if (toStatus === 'visible') {
        state.visibleData.push(convertedRestaurant);
      } else if (toStatus === 'accepted') {
        state.acceptedData.push(convertedRestaurant);
      } else {
        state.rejectedData.push(convertedRestaurant);
      }
    },
    updateRestaurantSuccess: (state, action: PayloadAction<{
      restaurant: any;
      database: 'visible' | 'accepted' | 'rejected';
    }>) => {
      saveToHistory(state);
      const { restaurant, database } = action.payload;
      const convertedRestaurant = convertTimestamps(restaurant);
      
      if (database === 'visible') {
        state.visibleData = state.visibleData.map(r => r.id === restaurant.id ? convertedRestaurant : r);
      } else if (database === 'accepted') {
        state.acceptedData = state.acceptedData.map(r => r.id === restaurant.id ? convertedRestaurant : r);
      } else {
        state.rejectedData = state.rejectedData.map(r => r.id === restaurant.id ? convertedRestaurant : r);
      }
    },
    undo: (state) => {
      if (state.past.length > 0) {
        const previous = state.past[state.past.length - 1];
        state.future.push({
          visibleData: [...state.visibleData],
          acceptedData: [...state.acceptedData],
          rejectedData: [...state.rejectedData]
        });
        state.visibleData = [...previous.visibleData];
        state.acceptedData = [...previous.acceptedData];
        state.rejectedData = [...previous.rejectedData];
        state.past.pop();
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const next = state.future[state.future.length - 1];
        state.past.push({
          visibleData: [...state.visibleData],
          acceptedData: [...state.acceptedData],
          rejectedData: [...state.rejectedData]
        });
        state.visibleData = [...next.visibleData];
        state.acceptedData = [...next.acceptedData];
        state.rejectedData = [...next.rejectedData];
        state.future.pop();
      }
    }
  }
});

// Thunks
export const fetchRestaurants = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Fetch from all collections
    const [visibleSnapshot, acceptedSnapshot, rejectedSnapshot] = await Promise.all([
      getDocs(collection(db, 'restaurants')),
      getDocs(collection(db, 'restaurants_accepted')),
      getDocs(collection(db, 'restaurants_rejected'))
    ]);

    const visible = visibleSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      status: 'visible'
    })) as Restaurant[];

    const accepted = acceptedSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      status: 'accepted'
    })) as Restaurant[];

    const rejected = rejectedSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      status: 'rejected'
    })) as Restaurant[];

    dispatch(setInitialData({ visible, accepted, rejected }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const addRestaurant = (restaurant: Omit<Restaurant, 'id'>) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const docRef = await addDoc(collection(db, 'restaurants'), {
      ...restaurant,
      status: 'visible',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    dispatch(addRestaurantSuccess({ ...restaurant, id: docRef.id }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteRestaurant = (id: string, database: 'visible' | 'accepted' | 'rejected') => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const collectionName = database === 'visible' ? 'restaurants' : 
                          database === 'accepted' ? 'restaurants_accepted' : 
                          'restaurants_rejected';
    
    await deleteDoc(doc(db, collectionName, id));
    dispatch(deleteRestaurantSuccess({ id, database }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const moveRestaurant = (
  restaurant: Restaurant,
  fromStatus: 'visible' | 'accepted' | 'rejected',
  toStatus: 'visible' | 'accepted' | 'rejected'
) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Delete from source collection
    const sourceCollection = fromStatus === 'visible' ? 'restaurants' :
                           fromStatus === 'accepted' ? 'restaurants_accepted' :
                           'restaurants_rejected';
    
    // Add to destination collection
    const destCollection = toStatus === 'visible' ? 'restaurants' :
                         toStatus === 'accepted' ? 'restaurants_accepted' :
                         'restaurants_rejected';
    
    const { id, ...restaurantData } = restaurant;
    
    // Add to new collection first
    const newDocRef = await addDoc(collection(db, destCollection), {
      ...restaurantData,
      status: toStatus,
      updatedAt: serverTimestamp()
    });
    
    // Then delete from old collection
    await deleteDoc(doc(db, sourceCollection, id!));
    
    dispatch(moveRestaurantSuccess({ 
      restaurant: { ...restaurant, id: newDocRef.id, status: toStatus }, 
      fromStatus, 
      toStatus 
    }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateRestaurant = (
  restaurant: Restaurant,
  database: 'visible' | 'accepted' | 'rejected'
) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const collectionName = database === 'visible' ? 'restaurants' :
                          database === 'accepted' ? 'restaurants_accepted' :
                          'restaurants_rejected';
    
    const { id, ...updateData } = restaurant;
    await updateDoc(doc(db, collectionName, id!), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    dispatch(updateRestaurantSuccess({ restaurant, database }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const {
  setLoading,
  setError,
  setInitialData,
  addRestaurantSuccess,
  deleteRestaurantSuccess,
  moveRestaurantSuccess,
  updateRestaurantSuccess,
  undo,
  redo
} = restaurantSlice.actions;

export default restaurantSlice.reducer;