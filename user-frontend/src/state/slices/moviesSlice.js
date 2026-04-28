import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { requestManager } from "../../utils/requestManager";

export const fetchMovies = createAsyncThunk(
  "movies/fetchMovies",
  async (params = {}, { rejectWithValue, signal }) => {
    const requestId = requestManager.getNextId("movies");
    try {
      const response = await apiClient.get("/movies/list", {
        params: { page: 1, limit: 20, ...params },
        signal
      });
      if (!requestManager.isValid("movies", requestId)) return rejectWithValue("stale_request");
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTheaters = createAsyncThunk(
  "movies/fetchTheaters",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/theatres/list", { params, signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMoviesByTheatre = createAsyncThunk(
  "movies/fetchMoviesByTheatre",
  async (theatreId, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/theatres/${theatreId}/showtimes/active`, { signal });
      return { theatreId, data: response.data || [] };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMovieDetail = createAsyncThunk(
  "movies/fetchMovieDetail",
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get(`/movies/get/${id}`, { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentMovies:    [],
  upcomingMovies:   [],
  theaters:         [],
  moviesByTheatre:  {},
  currMovieDetail:  null,

  storedParams: {
    search: "",
    page:   1
  },

  status: "idle",
  error:  null,
  moviesPage: {
    currentPage: 1,
    totalPages:  1,
    isLoading:   false
  }
};

const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    setMovieParams: (state, action) => {
      state.storedParams = { ...state.storedParams, ...action.payload };
      if (action.payload.search) state.storedParams.page = 1;
    },
    clearMovieDetail: (state) => {
      state.currMovieDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.status = "loading";
        state.moviesPage.isLoading = true;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.moviesPage.isLoading = false;

        const normalize = (item) => ({
          ...item,
          title: item.movieName || item.title,
          poster: item.thumbnail || item.poster,
        });

        const items = (action.payload.data || []).map(normalize);
        state.currentMovies  = items.filter(m => m?.status === "now_showing");
        state.upcomingMovies = items.filter(m => m?.status === "coming_soon");
        if (action.payload.pagination) {
          state.moviesPage.totalPages  = action.payload.pagination.totalPages;
          state.moviesPage.currentPage = action.payload.pagination.page || 1;
        }
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        if (action.payload === "stale_request") return;
        state.status = "failed";
        state.moviesPage.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMovieDetail.fulfilled, (state, action) => {
        state.currMovieDetail = action.payload.data;
      })
      .addCase(fetchTheaters.fulfilled, (state, action) => {
        state.theaters = (action.payload.data || []).map(item => ({
          ...item,
          name: item.theatreName || item.name,
        }));
      })
      .addCase(fetchMoviesByTheatre.fulfilled, (state, action) => {
        state.moviesByTheatre[action.payload.theatreId] = (action.payload.data || []).map(item => ({
          ...item,
          title:       item.movieName || item.title,
          poster:      item.movieThumbnail || item.poster,
          showTimings: item.timings || item.showTimings || [],
        }));
      });
  }
});

export const { setMovieParams, clearMovieDetail } = moviesSlice.actions;
export default moviesSlice.reducer;
