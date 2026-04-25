import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch Tourism List
 */
export const fetchTourism = createAsyncThunk(
  "tourism/fetchTourism",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("tourism");
    try {
      const response = await apiClient.get("/tourism/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("tourism", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Tourism Detail
 */
export const fetchTourismDetail = createAsyncThunk(
  "tourism/fetchTourismDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/tourism/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Display Photos (top 3, drag-ordered)
 */
export const fetchDisplayPhotos = createAsyncThunk(
  "tourism/fetchDisplayPhotos",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/tourism/display-photos/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Tourism Categories
 */
export const fetchTourismCategories = createAsyncThunk(
  "tourism/fetchTourismCategories",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/tourism/categories/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tourismList: [],
  displayPhotos: [],
  popularDestinations: [],
  categories: [],
  currTourismDetail: null,
  
  storedParams: {
    category: "All",
    search: "",
    page: 1
  },

  status: "idle",
  error: null,
  tourismPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const tourismSlice = createSlice({
  name: "tourism",
  initialState,
  reducers: {
    setTourismParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearTourismDetail: (state) => {
      state.currTourismDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTourism.pending, (state) => {
        state.status = "loading";
        state.tourismPage.isLoading = true;
      })
      .addCase(fetchTourism.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tourismPage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          name: item.placeName || item.name,
          image: item.thumbnail || item.image,
        });

        const tourismItems = (action.payload.data || []).map(normalize);
        state.tourismList = tourismItems;
        state.popularDestinations = tourismItems.filter(t => t.isPopular).slice(0, 10);

        if (action.payload.pagination) {
          state.tourismPage.totalPages = action.payload.pagination.totalPages;
          state.tourismPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchTourism.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.tourismPage.isLoading = false;
        state.error = action.payload;
        state.tourismList = [];
      })
      .addCase(fetchTourismDetail.fulfilled, (state, action) => {
        state.currTourismDetail = action.payload.data;
      })
      .addCase(fetchDisplayPhotos.fulfilled, (state, action) => {
        state.displayPhotos = action.payload.data || [];
      })
      .addCase(fetchTourismCategories.fulfilled, (state, action) => {
        state.categories = (action.payload.data || []).map(c => ({
          ...c,
          label: c.label || c.name || c.id,
        }));
      });
  }
});

export const { setTourismParams, clearTourismDetail } = tourismSlice.actions;
export default tourismSlice.reducer;
