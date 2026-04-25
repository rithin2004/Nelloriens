import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

/**
 * Fetch Transport List
 */
export const fetchTransports = createAsyncThunk(
  "transport/fetchTransports",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("transport");
    try {
      const response = await apiClient.get("/transport/list", {
        params: {
          page: 1,
          limit: 20,
          ...params
        },
        signal
      });

      if (!requestManager.isValid("transport", requestId)) {
        return rejectWithValue("stale_request");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Transport Detail
 */
export const fetchTransportDetail = createAsyncThunk(
  "transport/fetchTransportDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/transport/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  transports: [],
  categories: [],
  currTransportDetail: null,
  
  storedParams: {
    category: "All",
    search: "",
    page: 1
  },

  status: "idle",
  error: null,
  transportPage: {
    currentPage: 1,
    totalPages: 1,
    isLoading: false
  }
};

const transportSlice = createSlice({
  name: "transport",
  initialState,
  reducers: {
    setTransportParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.category || action.payload.search) {
        state.storedParams.page = 1;
      }
    },
    clearTransportDetail: (state) => {
      state.currTransportDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransports.pending, (state) => {
        state.status = "loading";
        state.transportPage.isLoading = true;
      })
      .addCase(fetchTransports.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.transportPage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          category: item.type || item.category,
          number: item.trainNumber || item.routeNumber || item.number,
          type: item.trainType || item.busType || item.type,
          from: item.fromStation || item.fromStop || item.from,
          to: item.toStation || item.toStop || item.to,
        });

        state.transports = (action.payload.data || []).map(normalize);

        if (action.payload.pagination) {
          state.transportPage.totalPages = action.payload.pagination.totalPages;
          state.transportPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchTransports.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.transportPage.isLoading = false;
        state.error = action.payload;
        state.transports = [];
      })
      .addCase(fetchTransportDetail.fulfilled, (state, action) => {
        state.currTransportDetail = action.payload.data;
      });
  }
});

export const { setTransportParams, clearTransportDetail } = transportSlice.actions;
export default transportSlice.reducer;
