import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CategoryState {
  currentCategory: string;
  categories: string[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  currentCategory: 'Restaurants',
  categories: [],
  loading: false,
  error: null
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const categories = querySnapshot.docs.map(doc => doc.data().name);
    if (categories.length === 0) {
      // If no categories exist, create default ones
      const defaultCategories = [
        'Restaurants',
        'Hôtels',
        'Bars',
        'Cafés',
        'Boutiques',
        'Musées',
        'Galeries',
        'Cinémas',
        'Théâtres',
        'Salles de Concert',
        'Parcs',
        'Centres Commerciaux',
        'Spas',
        'Salons de Beauté',
        'Clubs de Sport'
      ];

      // Add default categories to Firestore
      await Promise.all(
        defaultCategories.map(category =>
          addDoc(collection(db, 'categories'), {
            name: category,
            createdAt: serverTimestamp()
          })
        )
      );

      return defaultCategories;
    }
    return categories;
  }
);

export const addCategoryToFirestore = createAsyncThunk(
  'categories/addCategory',
  async (categoryName: string) => {
    await addDoc(collection(db, 'categories'), {
      name: categoryName,
      createdAt: serverTimestamp()
    });
    return categoryName;
  }
);

export const deleteCategoryFromFirestore = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryName: string) => {
    const categoryQuery = query(
      collection(db, 'categories'),
      where('name', '==', categoryName)
    );
    const querySnapshot = await getDocs(categoryQuery);
    
    await Promise.all(
      querySnapshot.docs.map(doc => deleteDoc(doc.ref))
    );
    
    return categoryName;
  }
);

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.currentCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        if (!state.categories.includes(state.currentCategory)) {
          state.currentCategory = state.categories[0];
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      .addCase(addCategoryToFirestore.fulfilled, (state, action) => {
        if (!state.categories.includes(action.payload)) {
          state.categories.push(action.payload);
        }
      })
      .addCase(deleteCategoryFromFirestore.fulfilled, (state, action) => {
        state.categories = state.categories.filter(cat => cat !== action.payload);
        if (state.currentCategory === action.payload) {
          state.currentCategory = state.categories[0];
        }
      });
  }
});

export const { setCategory } = categorySlice.actions;
export default categorySlice.reducer;