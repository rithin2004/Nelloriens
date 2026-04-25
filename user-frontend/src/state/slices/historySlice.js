import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch History List
 */
export const fetchHistory = createAsyncThunk(
  "history/fetchHistory",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("history");
    try {
      const response = await apiClient.get("/history/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("history", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch History Detail
 */
export const fetchHistoryDetail = createAsyncThunk(
  "history/fetchHistoryDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/history/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  timelineData: [],
  historyEras: [],
  currentSectionDetail: null,

  storedParams: {
    category: "All",
    search: "",
    page: 1
  },

  status: "idle",
  error: null,
  historyPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setHistoryParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearHistoryDetail: (state) => {
      state.currentSectionDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.status = "loading";
        state.historyPage.isLoading = true;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.historyPage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          period: item.eraPeriod || item.period,
          year: item.yearLabel || item.year,
        });

        state.timelineData = (action.payload.data || []).map(normalize);

        const reqCategory = action.meta.arg?.category;
        if (!reqCategory || reqCategory === "All") {
          const seen = new Set();
          const eras = [];
          for (const item of state.timelineData) {
            const cat = item.categoryLabel || item.category;
            if (cat && !seen.has(cat)) { seen.add(cat); eras.push(cat); }
          }
          if (eras.length > 0) state.historyEras = eras;
        }

        if (action.payload.pagination) {
          state.historyPage.totalPages = action.payload.pagination.totalPages;
          state.historyPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.historyPage.isLoading = false;
        state.error = action.payload;
        state.timelineData = [];
      })
      .addCase(fetchHistoryDetail.fulfilled, (state, action) => {
        state.currentSectionDetail = action.payload.data;
      });
  }
});

export const { setHistoryParams, clearHistoryDetail } = historySlice.actions;
export default historySlice.reducer;
