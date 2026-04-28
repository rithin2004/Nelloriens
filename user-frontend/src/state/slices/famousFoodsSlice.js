import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch Famous Foods List (non-popular, paginated)
 */
export const fetchFamousFoods = createAsyncThunk(
  "famousFoods/fetchFamousFoods",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("foods");
    try {
      const response = await apiClient.get("/foods/varieties/list", {
        params: { page: 1, limit: 20, popular: "false", ...params },
        signal
      });

      if (!requestManager.isValid("foods", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Popular Varieties (up to 6, popular=true)
 */
export const fetchPopularVarieties = createAsyncThunk(
  "famousFoods/fetchPopularVarieties",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/foods/varieties/list", {
        params: { popular: "true", limit: 6, ...params },
        signal
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Display Photos (admin-set hero photos)
 */
export const fetchDisplayPhotos = createAsyncThunk(
  "famousFoods/fetchDisplayPhotos",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/foods/photos/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Famous Food Detail
 */
export const fetchFamousFoodDetail = createAsyncThunk(
  "famousFoods/fetchFamousFoodDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/foods/varieties/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Sweets
 */
export const fetchSweets = createAsyncThunk(
  "famousFoods/fetchSweets",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/foods/sweets/list", {
        params: { page: 1, limit: 20, ...params },
        signal
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Food Categories
 */
export const fetchFoodCategories = createAsyncThunk(
  "famousFoods/fetchFoodCategories",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/foods/categories/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Health Tips
 */
export const fetchHealthTips = createAsyncThunk(
  "famousFoods/fetchHealthTips",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/foods/healthtips/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  signatureDishes: [],
  popularVarieties: [],
  displayPhotos: [],
  sweets: [],
  categories: [],
  healthTips: [],
  currentFoodDetail: null,

  storedParams: {
    category: "All",
    search: "",
    page: 1
  },

  status: "idle",
  error: null,
  foodsPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const famousFoodsSlice = createSlice({
  name: "famousFoods",
  initialState,
  reducers: {
    setFoodParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearFoodDetail: (state) => {
      state.currentFoodDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFamousFoods.pending, (state) => {
        state.status = "loading";
        state.foodsPage.isLoading = true;
      })
      .addCase(fetchFamousFoods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.foodsPage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          image: item.thumbnail || item.image,
        });

        state.signatureDishes = (action.payload.data || []).map(normalize);

        if (action.payload.pagination) {
          state.foodsPage.totalPages = action.payload.pagination.totalPages;
          state.foodsPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchFamousFoods.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.foodsPage.isLoading = false;
        state.error = action.payload;
        state.signatureDishes = [];
      })
      .addCase(fetchFamousFoodDetail.fulfilled, (state, action) => {
        state.currentFoodDetail = action.payload.data;
      })
      .addCase(fetchHealthTips.fulfilled, (state, action) => {
        state.healthTips = action.payload.data || [];
      })
      .addCase(fetchSweets.fulfilled, (state, action) => {
        const normalize = (item) => ({ ...item, image: item.thumbnail || item.image });
        state.sweets = (action.payload.data || []).map(normalize);
      })
      .addCase(fetchFoodCategories.fulfilled, (state, action) => {
        state.categories = (action.payload.data || []).map(c => ({
          ...c,
          label: c.label || c.name || c.id,
        }));
      })
      .addCase(fetchPopularVarieties.fulfilled, (state, action) => {
        const normalize = (item) => ({ ...item, image: item.thumbnail || item.image });
        state.popularVarieties = (action.payload.data || []).map(normalize);
      })
      .addCase(fetchDisplayPhotos.fulfilled, (state, action) => {
        state.displayPhotos = action.payload.data || [];
      });
  }
});

export const { setFoodParams, clearFoodDetail } = famousFoodsSlice.actions;
export default famousFoodsSlice.reducer;

