import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

export const performGlobalSearch = createAsyncThunk(
  "search/performGlobalSearch",
  async ({ query, limit = 20 }, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("search");
    try {
      const response = await apiClient.get("/search", {
        params: { q: query, limit },
        signal
      });

      if (!requestManager.isValid("search", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response; // response is already normalized by apiClient interceptor
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    results: [],
    loading: false,
    error: null,
    query: ""
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.query = action.payload;
    },
    clearResults: (state) => {
      state.results = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(performGlobalSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performGlobalSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
      })
      .addCase(performGlobalSearch.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSearchQuery, clearResults } = searchSlice.actions;
export default searchSlice.reducer;
