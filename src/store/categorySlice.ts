import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CategoryState {
  currentCategory: string;
  categories: string[];
}

const initialState: CategoryState = {
  currentCategory: 'Restaurants',
  categories: ['Restaurants', 'Hôtels']
};

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.currentCategory = action.payload;
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat !== action.payload);
      if (state.currentCategory === action.payload) {
        state.currentCategory = state.categories[0];
      }
    }
  }
});

export const { setCategory, addCategory, removeCategory } = categorySlice.actions;
export default categorySlice.reducer;