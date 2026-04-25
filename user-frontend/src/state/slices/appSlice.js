import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: 'English',
  theme: 'light',
  scope: 'global', // Nellore default
  moduleParams: {
    news: { page: 1, limit: 20 },
    sports: { limit: 10 },
    jobs: { page: 1, limit: 10 }
  }
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setScope: (state, action) => {
      state.scope = action.payload;
    },
    updateModuleParams: (state, action) => {
      const { module, params } = action.payload;
      state.moduleParams[module] = { ...state.moduleParams[module], ...params };
    }
  },
});

export const { setLanguage, setTheme, setScope, updateModuleParams } = appSlice.actions;
export default appSlice.reducer;
