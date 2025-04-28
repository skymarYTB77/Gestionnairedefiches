import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
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

const convertTimestamps = (data: any): Restaurant => {
  const converted = { ...data };
  if (converted.createdAt?.toDate) {
    converted.createdAt = converted.createdAt.toDate().toISOString();
  }
  if (converted.updatedAt?.toDate) {
    converted.updatedAt = converted.updatedAt.toDate().toISOString();
  }
  return converted;
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
      visible: Restaurant[];
      accepted: Restaurant[];
      rejected: Restaurant[];
    }>) => {
      state.visibleData = action.payload.visible;
      state.acceptedData = action.payload.accepted;
      state.rejectedData = action.payload.rejected;
    },
    addRestaurantSuccess: (state, action: PayloadAction<Restaurant>) => {
      saveToHistory(state);
      state.visibleData.push(action.payload);
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
      restaurant: Restaurant;
      fromStatus: 'visible' | 'accepted' | 'rejected';
      toStatus: 'visible' | 'accepted' | 'rejected';
    }>) => {
      saveToHistory(state);
      const { restaurant, fromStatus, toStatus } = action.payload;
      
      // Remove from source
      if (fromStatus === 'visible') {
        state.visibleData = state.visibleData.filter(r => r.id !== restaurant.id);
      } else if (fromStatus === 'accepted') {
        state.acceptedData = state.acceptedData.filter(r => r.id !== restaurant.id);
      } else {
        state.rejectedData = state.rejectedData.filter(r => r.id !== restaurant.id);
      }

      // Add to destination
      if (toStatus === 'visible') {
        state.visibleData.push(restaurant);
      } else if (toStatus === 'accepted') {
        state.acceptedData.push(restaurant);
      } else {
        state.rejectedData.push(restaurant);
      }
    },
    updateRestaurantSuccess: (state, action: PayloadAction<{
      restaurant: Restaurant;
      database: 'visible' | 'accepted' | 'rejected';
    }>) => {
      saveToHistory(state);
      const { restaurant, database } = action.payload;
      
      if (database === 'visible') {
        state.visibleData = state.visibleData.map(r => 
          r.id === restaurant.id ? restaurant : r
        );
      } else if (database === 'accepted') {
        state.acceptedData = state.acceptedData.map(r => 
          r.id === restaurant.id ? restaurant : r
        );
      } else {
        state.rejectedData = state.rejectedData.map(r => 
          r.id === restaurant.id ? restaurant : r
        );
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
    console.log('Fetching restaurants...');
    
    // Fetch from all collections
    const [visibleSnapshot, acceptedSnapshot, rejectedSnapshot] = await Promise.all([
      getDocs(collection(db, 'restaurants')),
      getDocs(collection(db, 'restaurants_accepted')),
      getDocs(collection(db, 'restaurants_rejected'))
    ]);

    console.log('Raw visible snapshot:', visibleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    console.log('Raw accepted snapshot:', acceptedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    console.log('Raw rejected snapshot:', rejectedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

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

    console.log('Processed visible data:', visible);
    console.log('Processed accepted data:', accepted);
    console.log('Processed rejected data:', rejected);

    dispatch(setInitialData({ visible, accepted, rejected }));
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const addRestaurant = (restaurant: Omit<Restaurant, 'id'>) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    console.log('Adding restaurant:', restaurant);
    
    const docRef = await addDoc(collection(db, 'restaurants'), {
      ...restaurant,
      status: 'visible',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Restaurant added with ID:', docRef.id);
    dispatch(addRestaurantSuccess({ ...restaurant, id: docRef.id }));
  } catch (error) {
    console.error('Error adding restaurant:', error);
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteRestaurant = (id: string, database: 'visible' | 'accepted' | 'rejected') => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    console.log('Deleting restaurant:', { id, database });
    
    const collectionName = database === 'visible' ? 'restaurants' : 
                          database === 'accepted' ? 'restaurants_accepted' : 
                          'restaurants_rejected';
    
    await deleteDoc(doc(db, collectionName, id));
    console.log('Restaurant deleted successfully');
    dispatch(deleteRestaurantSuccess({ id, database }));
  } catch (error) {
    console.error('Error deleting restaurant:', error);
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
    console.log('Moving restaurant:', { restaurant, fromStatus, toStatus });
    
    const sourceCollection = fromStatus === 'visible' ? 'restaurants' :
                           fromStatus === 'accepted' ? 'restaurants_accepted' :
                           'restaurants_rejected';
    
    const destCollection = toStatus === 'visible' ? 'restaurants' :
                         toStatus === 'accepted' ? 'restaurants_accepted' :
                         'restaurants_rejected';
    
    const { id, ...restaurantData } = restaurant;
    
    const newDocRef = await addDoc(collection(db, destCollection), {
      ...restaurantData,
      status: toStatus,
      updatedAt: serverTimestamp()
    });
    
    await deleteDoc(doc(db, sourceCollection, id!));
    
    console.log('Restaurant moved successfully');
    dispatch(moveRestaurantSuccess({ 
      restaurant: { ...restaurant, id: newDocRef.id, status: toStatus }, 
      fromStatus, 
      toStatus 
    }));
  } catch (error) {
    console.error('Error moving restaurant:', error);
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
    console.log('Updating restaurant:', { restaurant, database });
    
    const collectionName = database === 'visible' ? 'restaurants' :
                          database === 'accepted' ? 'restaurants_accepted' :
                          'restaurants_rejected';
    
    const { id, ...updateData } = restaurant;
    await updateDoc(doc(db, collectionName, id!), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    console.log('Restaurant updated successfully');
    dispatch(updateRestaurantSuccess({ restaurant, database }));
  } catch (error) {
    console.error('Error updating restaurant:', error);
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