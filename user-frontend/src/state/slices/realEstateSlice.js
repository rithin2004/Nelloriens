import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch Real Estate Properties List
 */
export const fetchProperties = createAsyncThunk(
  "realEstate/fetchProperties",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("realestate");
    try {
      const response = await apiClient.get("/realestate/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("realestate", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Property Detail
 */
export const fetchPropertyDetail = createAsyncThunk(
  "realEstate/fetchPropertyDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/realestate/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Property Categories & Locations
 */
export const fetchPropertyMetadata = createAsyncThunk(
  "realEstate/fetchPropertyMetadata",
  async (_, { rejectWithValue, signal }) => {
    try {
      const [cats, locs] = await Promise.all([
        apiClient.get("/realestate/types/list", { signal }),
        apiClient.get("/realestate/locations/list", { signal })
      ]);
      return { categories: cats.data, locations: locs.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  propertiesList: [],
  categories: [],
  locations: [],
  currPropertyDetail: null,
  
  storedParams: {
    status: "sale", // sale | rent
    category: "All",
    location: "All",
    bhk: "All",
    maxPrice: 20000000,
    search: "",
    page: 1
  },

  status: "idle",
  error: null,
  realEstatePage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const realEstateSlice = createSlice({
  name: "realEstate",
  initialState,
  reducers: {
    setPropertyParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      // Reset page on filter change
      if (action.payload.category || action.payload.location || action.payload.status || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearPropertyDetail: (state) => {
      state.currPropertyDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.status = "loading";
        state.realEstatePage.isLoading = true;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.realEstatePage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          image: item.thumbnail || item.image,
          area: item.sqft ? `${item.sqft} sqft` : (item.area || ""),
          price: item.price || item.monthlyRent,
          locationAddress: item.location || item.locationAddress,
        });

        state.propertiesList = (action.payload.data || []).map(normalize);

        if (action.payload.pagination) {
          state.realEstatePage.totalPages = action.payload.pagination.totalPages;
          state.realEstatePage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.realEstatePage.isLoading = false;
        state.error = action.payload;
        state.propertiesList = [];
      })
      .addCase(fetchPropertyDetail.fulfilled, (state, action) => {
        state.currPropertyDetail = action.payload.data;
      })
      .addCase(fetchPropertyMetadata.fulfilled, (state, action) => {
        state.categories = (action.payload.categories || []).map(c => ({
          ...c,
          label: c.label || c.name || c.id,
        }));
        state.locations = (action.payload.locations || []).map(l => ({
          ...l,
          label: l.label || l.name || l.id,
        }));
      });
  }
});

export const { setPropertyParams, clearPropertyDetail } = realEstateSlice.actions;
export default realEstateSlice.reducer;
