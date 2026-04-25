import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch Jobs List
 */
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("jobs");
    try {
      const response = await apiClient.get("/jobs/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("jobs", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Job Detail
 */
export const fetchJobDetail = createAsyncThunk(
  "jobs/fetchJobDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/jobs/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Job Categories & Locations
 */
export const fetchJobMetadata = createAsyncThunk(
  "jobs/fetchJobMetadata",
  async (_, { rejectWithValue, signal }) => {
    try {
      const [cats, locs] = await Promise.all([
        apiClient.get("/jobs/categories/list", { signal }),
        apiClient.get("/jobs/locations/list", { signal })
      ]);
      return { categories: cats.data, locations: locs.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  jobsList: [],
  categories: [],
  locations: [],
  currJobDetail: null,
  
  storedParams: {
    category: "All",
    location: "All",
    search: "",
    page: 1
  },

  status: "idle",
  error: null,
  jobsPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.location || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearJobDetail: (state) => {
      state.currJobDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = "loading";
        state.jobsPage.isLoading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.jobsPage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          company: item.companyName || item.company,
          salary: item.salaryRange || item.salary,
          postedAt: item.publishedAt || item.postedAt,
          description: item.shortDescription || item.description,
          applyLink: item.redirectUrl || item.applyLink,
        });

        state.jobsList = (action.payload.data || []).map(normalize);

        if (action.payload.pagination) {
          state.jobsPage.totalPages = action.payload.pagination.totalPages;
          state.jobsPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.jobsPage.isLoading = false;
        state.error = action.payload;
        state.jobsList = [];
      })
      .addCase(fetchJobDetail.fulfilled, (state, action) => {
        state.currJobDetail = action.payload.data;
      })
      .addCase(fetchJobMetadata.fulfilled, (state, action) => {
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

export const { setJobParams, clearJobDetail } = jobsSlice.actions;
export default jobsSlice.reducer;
