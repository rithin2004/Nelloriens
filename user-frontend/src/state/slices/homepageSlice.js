import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  selectedCategory: null,
  isSearchFocused: false,
};

const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchFocused: (state, action) => {
      state.isSearchFocused = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.selectedCategory = null;
    },
  },
});

export const { setSearchQuery, setSelectedCategory, setSearchFocused, clearSearch } = homepageSlice.actions;
export default homepageSlice.reducer;

