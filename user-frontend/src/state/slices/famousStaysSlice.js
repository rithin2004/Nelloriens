import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch Famous Stays List
 */
export const fetchFamousStays = createAsyncThunk(
  "famousStays/fetchFamousStays",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("stay");
    try {
      const response = await apiClient.get("/stays/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("stay", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Famous Stay Detail
 */
export const fetchFamousStayDetail = createAsyncThunk(
  "famousStays/fetchFamousStayDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/stays/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Stay Categories
 */
export const fetchStayCategories = createAsyncThunk(
  "famousStays/fetchStayCategories",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/stays/categories/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  topPicks: [],
  categories: [],
  currentStayDetail: null,
  
  storedParams: {
    category: "All",
    search: "",
    page: 1
  },

  status: "idle",
  error: null,
  staysPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const famousStaysSlice = createSlice({
  name: "famousStays",
  initialState,
  reducers: {
    setStayParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearStayDetail: (state) => {
      state.currentStayDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFamousStays.pending, (state) => {
        state.status = "loading";
        state.staysPage.isLoading = true;
      })
      .addCase(fetchFamousStays.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.staysPage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          name: item.hotelName || item.name,
          image: item.thumbnail || item.image,
          rating: item.starRating || item.rating,
          price: item.pricePerNight || item.price,
          location: item.address || item.location,
          isFeatured: item.isTop || false,
        });

        state.topPicks = (action.payload.data || []).map(normalize);

        if (action.payload.pagination) {
          state.staysPage.totalPages = action.payload.pagination.totalPages;
          state.staysPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchFamousStays.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.staysPage.isLoading = false;
        state.error = action.payload;
        state.topPicks = [];
      })
      .addCase(fetchFamousStayDetail.fulfilled, (state, action) => {
        state.currentStayDetail = action.payload.data;
      })
      .addCase(fetchStayCategories.fulfilled, (state, action) => {
        state.categories = (action.payload.data || []).map(c => ({
          ...c,
          label: c.label || c.name || c.id,
        }));
      });
  }
});

export const { setStayParams, clearStayDetail } = famousStaysSlice.actions;
export default famousStaysSlice.reducer;
