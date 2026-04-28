import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch News List
 * Params: scope, category, search, page, limit
 */
export const fetchNews = createAsyncThunk(
  "news/fetchNews",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("news");
    try {
      const response = await apiClient.get("/news/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("news", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch News Detail
 */
export const fetchNewsDetail = createAsyncThunk(
  "news/fetchNewsDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/news/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Breaking Points
 */
export const fetchBreakingPoints = createAsyncThunk(
  "news/fetchBreakingPoints",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/news/breaking-points/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch News Categories
 */
export const fetchNewsCategories = createAsyncThunk(
  "news/fetchNewsCategories",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/news/categories/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Data
  newsFeedArticles: [],
  breakingPoints: [],
  newsFeedFilters: [{ id: "All", label: "All", icon: "bi-grid" }],
  currNewsDetail: null,
  
  // SSE Param Registry
  storedParams: {
    scope: "nellore",
    category: "All",
    search: "",
    page: 1
  },

  // UI State
  status: "idle",
  error: null,
  newsPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    setNewsParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      // Pagination Reset Rule: setPage(1) on filter change
      if (action.payload.category || action.payload.scope || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearNewsDetail: (state) => {
      state.currNewsDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch News
      .addCase(fetchNews.pending, (state) => {
        state.status = "loading";
        state.newsPage.isLoading = true;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.newsPage.isLoading = false;
        
        // Strict replacement - No merging
        state.newsFeedArticles = action.payload.data || [];
        
        if (action.payload.pagination) {
          state.newsPage.totalPages = action.payload.pagination.totalPages;
          state.newsPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchNews.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.newsPage.isLoading = false;
        state.error = action.payload;
        state.newsFeedArticles = []; // Clear on error
      })

      // Fetch Detail
      .addCase(fetchNewsDetail.fulfilled, (state, action) => {
        state.currNewsDetail = action.payload.data;
      })

      // Fetch Breaking Points — filter out expired items
      .addCase(fetchBreakingPoints.fulfilled, (state, action) => {
        const now = new Date();
        state.breakingPoints = (action.payload.data || []).filter((item) => {
          if (!item.expiresAt) return true;
          return now < new Date(item.expiresAt);
        });
      })

      // Fetch Categories
      .addCase(fetchNewsCategories.fulfilled, (state, action) => {
        const apiCats = (action.payload.data || []).map(cat => ({
          id: cat._id,
          label: cat.name,
          icon: cat.icon || "bi-tag"
        }));
        state.newsFeedFilters = [{ id: "All", label: "All", icon: "bi-grid" }, ...apiCats];
      });
  }
});

export const { setNewsParams, clearNewsDetail } = newsSlice.actions;
export default newsSlice.reducer;
