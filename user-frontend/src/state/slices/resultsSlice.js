import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch Results List
 */
export const fetchResults = createAsyncThunk(
  "results/fetchResults",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("results");
    try {
      const response = await apiClient.get("/results/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("results", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Result Detail
 */
export const fetchResultDetail = createAsyncThunk(
  "results/fetchResultDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/results/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Result Categories
 */
export const fetchResultCategories = createAsyncThunk(
  "results/fetchResultCategories",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/results/categories/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  resultsList: [],
  categories: [],
  currResultDetail: null,
  
  storedParams: {
    category: "All",
    search: "",
    page: 1
  },

  status: "idle",
  error: null,
  resultsPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const resultsSlice = createSlice({
  name: "results",
  initialState,
  reducers: {
    setResultParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearResultDetail: (state) => {
      state.currResultDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.status = "loading";
        state.resultsPage.isLoading = true;
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.resultsPage.isLoading = false;

        const normalize = (item) => {
          const rawStatus = item.status || "";
          const status = rawStatus === "Released" ? "published"
            : rawStatus === "Scheduled" ? "upcoming"
            : rawStatus;
          return {
            ...item,
            title: item.examName || item.title,
            status,
            publishedDate: item.publishedAt || item.publishedDate,
            description: item.shortDescription || item.description,
            board: item.conductingBody || item.board,
            link: item.redirectUrl || item.link,
          };
        };

        state.resultsList = (action.payload.data || []).map(normalize);

        if (action.payload.pagination) {
          state.resultsPage.totalPages = action.payload.pagination.totalPages;
          state.resultsPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchResults.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.resultsPage.isLoading = false;
        state.error = action.payload;
        state.resultsList = [];
      })
      .addCase(fetchResultDetail.fulfilled, (state, action) => {
        state.currResultDetail = action.payload.data;
      })
      .addCase(fetchResultCategories.fulfilled, (state, action) => {
        state.categories = (action.payload.data || []).map(c => ({
          ...c,
          label: c.label || c.name || c.id,
        }));
      });
  }
});

export const { setResultParams, clearResultDetail } = resultsSlice.actions;
export default resultsSlice.reducer;
