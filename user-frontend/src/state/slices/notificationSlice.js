import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch Updates (alias: Notifications)
 */
export const fetchUpdates = createAsyncThunk(
  "notifications/fetchUpdates",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("updates");
    try {
      const response = await apiClient.get("/updates/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("updates", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Update Detail
 */
export const fetchUpdateDetail = createAsyncThunk(
  "notifications/fetchUpdateDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/updates/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Update Categories
 */
export const fetchUpdateCategories = createAsyncThunk(
  "notifications/fetchUpdateCategories",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/updates/categories/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notificationsList: [],
  categories: [],
  currNotificationDetail: null,
  
  storedParams: {
    category: "All",
    search: "",
    page: 1
  },

  status: "idle",
  error: null,
  notificationsPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setUpdateParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearUpdateDetail: (state) => {
      state.currNotificationDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpdates.pending, (state) => {
        state.status = "loading";
        state.notificationsPage.isLoading = true;
      })
      .addCase(fetchUpdates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notificationsPage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          timestamp: item.publishedAt || item.timestamp,
          description: item.message || item.description,
        });

        state.notificationsList = (action.payload.data || []).map(normalize);

        if (action.payload.pagination) {
          state.notificationsPage.totalPages = action.payload.pagination.totalPages;
          state.notificationsPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchUpdates.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.notificationsPage.isLoading = false;
        state.error = action.payload;
        state.notificationsList = [];
      })
      .addCase(fetchUpdateDetail.fulfilled, (state, action) => {
        state.currNotificationDetail = action.payload.data;
      })
      .addCase(fetchUpdateCategories.fulfilled, (state, action) => {
        state.categories = (action.payload.data || []).map(c => ({
          ...c,
          label: c.label || c.name || c.id,
        }));
      });
  }
});

export const { setUpdateParams, clearUpdateDetail } = notificationSlice.actions;
export default notificationSlice.reducer;
