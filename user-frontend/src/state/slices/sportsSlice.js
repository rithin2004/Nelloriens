import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

export const fetchSportsEvents = createAsyncThunk(
  "sports/fetchSportsEvents",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("sports_events");
    try {
      const response = await apiClient.get("/sports/list", {
        params: { type: "event", page: 1, limit: 50, ...params },
        signal
      });
      if (!requestManager.isValid("sports_events", requestId)) return rejectWithValue("stale_request");
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSportsArticles = createAsyncThunk(
  "sports/fetchSportsArticles",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("sports_articles");
    try {
      const response = await apiClient.get("/sports/list", {
        params: { type: "article", page: 1, limit: 20, ...params },
        signal
      });
      if (!requestManager.isValid("sports_articles", requestId)) return rejectWithValue("stale_request");
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSportCategories = createAsyncThunk(
  "sports/fetchSportCategories",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/sports/categories/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  sportsEvents:   [],
  sportsArticles: [],
  categories:     [],

  storedParams: {
    category: "All",
    search:   "",
    page:     1
  },

  status: "idle",
  error:  null,
  sportsPage: {
    currentPage: 1,
    totalPages:  1,
    isLoading:   false
  }
};

const sportsSlice = createSlice({
  name: "sports",
  initialState,
  reducers: {
    setSportParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSportsEvents.fulfilled, (state, action) => {
        if (action.payload === undefined) return;
        state.sportsEvents = (action.payload.data || []).map(item => ({
          ...item,
          image: item.thumbnail || item.image,
        }));
      })
      .addCase(fetchSportsArticles.pending, (state) => {
        state.status = "loading";
        state.sportsPage.isLoading = true;
      })
      .addCase(fetchSportsArticles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sportsPage.isLoading = false;
        state.sportsArticles = action.payload.data || [];
        if (action.payload.pagination) {
          state.sportsPage.totalPages  = action.payload.pagination.totalPages;
          state.sportsPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchSportsArticles.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.sportsPage.isLoading = false;
        state.error = action.payload;
        state.sportsArticles = [];
      })
      .addCase(fetchSportCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || [];
      });
  }
});

export const { setSportParams } = sportsSlice.actions;
export default sportsSlice.reducer;
