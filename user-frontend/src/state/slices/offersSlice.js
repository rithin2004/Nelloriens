import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch Offers List
 */
export const fetchOffers = createAsyncThunk(
  "offers/fetchOffers",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("offers");
    try {
      const response = await apiClient.get("/offers/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("offers", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Offer Detail
 */
export const fetchOfferDetail = createAsyncThunk(
  "offers/fetchOfferDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/offers/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Offer Categories
 */
export const fetchOfferCategories = createAsyncThunk(
  "offers/fetchOfferCategories",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/offers/categories/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  offersList: [],
  categories: [],
  currOfferDetail: null,
  
  storedParams: {
    category: "All",
    search: "",
    page: 1
  },

  status: "idle",
  error: null,
  offersPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    setOfferParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearOfferDetail: (state) => {
      state.currOfferDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.status = "loading";
        state.offersPage.isLoading = true;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.offersPage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          imageUrl: item.thumbnail || item.imageUrl,
          discount: item.discountPercent != null
            ? `${item.discountPercent}% OFF`
            : (item.discount || ""),
        });

        state.offersList = (action.payload.data || []).map(normalize);

        if (action.payload.pagination) {
          state.offersPage.totalPages = action.payload.pagination.totalPages;
          state.offersPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.offersPage.isLoading = false;
        state.error = action.payload;
        state.offersList = [];
      })
      .addCase(fetchOfferDetail.fulfilled, (state, action) => {
        state.currOfferDetail = action.payload.data;
      })
      .addCase(fetchOfferCategories.fulfilled, (state, action) => {
        state.categories = (action.payload.data || []).map(c => ({
          ...c,
          label: c.label || c.name || c.id,
        }));
      });
  }
});

export const { setOfferParams, clearOfferDetail } = offersSlice.actions;
export default offersSlice.reducer;
