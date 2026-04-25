import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch Events List
 */
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("events");
    try {
      const response = await apiClient.get("/events/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("events", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Event Detail
 */
export const fetchEventDetail = createAsyncThunk(
  "events/fetchEventDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/events/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Influencer Events
 */
export const fetchInfluencerEvents = createAsyncThunk(
  "events/fetchInfluencerEvents",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/events/influencer/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Event Categories
 */
export const fetchEventCategories = createAsyncThunk(
  "events/fetchEventCategories",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/events/categories/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Data
  latestEvents: [],
  popularEvents: [],
  influencerEvents: [],
  categories: [],
  currEventDetail: null,
  
  // SSE Param Registry
  storedParams: {
    category: "All",
    search: "",
    page: 1
  },

  // UI State
  status: "idle",
  error: null,
  eventsPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setEventParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearEventDetail: (state) => {
      state.currEventDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
        state.eventsPage.isLoading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.eventsPage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          title: item.eventName || item.title,
          image: item.thumbnail || item.image,
          date: item.startDate || item.date,
          authorName: item.organizer || item.authorName,
          authorImage: item.authorImage || null,
        });

        const items = (action.payload.data || []).map(normalize);
        state.latestEvents = items;
        state.popularEvents = items.filter(e => e?.isPopular).slice(0, 6);

        if (action.payload.pagination) {
          state.eventsPage.totalPages = action.payload.pagination.totalPages;
          state.eventsPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.eventsPage.isLoading = false;
        state.error = action.payload;
        state.latestEvents = [];
        state.popularEvents = [];
      })
      .addCase(fetchEventDetail.fulfilled, (state, action) => {
        state.currEventDetail = action.payload.data;
      })
      .addCase(fetchInfluencerEvents.fulfilled, (state, action) => {
        const normalize = (item) => ({
          ...item,
          title: item.eventName || item.title,
          image: item.thumbnail || item.image,
          date: item.startDate || item.date,
          authorName: item.organizer || item.authorName,
          authorImage: item.authorImage || null,
        });
        state.influencerEvents = (action.payload.data || []).map(normalize);
      })
      .addCase(fetchEventCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || [];
      });
  }
});

export const { setEventParams, clearEventDetail } = eventsSlice.actions;
export default eventsSlice.reducer;
