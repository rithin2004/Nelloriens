import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

/**
 * Fetch Ads List
 */
export const fetchAds = createAsyncThunk(
  "commonAds/fetchAds",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/ads/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Sponsorships List
 */
export const fetchSponsorships = createAsyncThunk(
  "commonAds/fetchSponsorships",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/sponsorships/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch Instagram Feed List
 */
export const fetchInstagramFeed = createAsyncThunk(
  "commonAds/fetchInstagramFeed",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await apiClient.get("/instagram/posts/list", { signal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  ads: [],
  sponsorships: [],
  instagramFeed: [],
  
  status: "idle",
  error: null,
  
  adsLoading: false,
  sponsorshipsLoading: false,
  instagramLoading: false
};

const commonAdsSlice = createSlice({
  name: "commonAds",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Ads
      .addCase(fetchAds.pending, (state) => {
        state.adsLoading = true;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.adsLoading = false;
        state.ads = (action.payload.data || []).map(item => ({
          ...item,
          id: item._id,
          image: item.image || item.thumbnailUrl || item.poster || item.imageUrl || null,
          title: item.title || item.name || '',
          link: item.link || item.url || '#',
          tagline: item.tagline || item.description || '',
        }));
      })
      .addCase(fetchAds.rejected, (state) => {
        state.adsLoading = false;
        state.ads = [];
      })

      // Sponsorships
      .addCase(fetchSponsorships.pending, (state) => {
        state.sponsorshipsLoading = true;
      })
      .addCase(fetchSponsorships.fulfilled, (state, action) => {
        state.sponsorshipsLoading = false;
        state.sponsorships = (action.payload.data || []).map(item => ({
          ...item,
          id: item._id,
          image: item.poster || item.logo || item.image || null,
          title: item.name || item.title || '',
          tagline: item.description || '',
          link: item.link || item.websiteUrl || '#',
        }));
      })
      .addCase(fetchSponsorships.rejected, (state) => {
        state.sponsorshipsLoading = false;
        state.sponsorships = [];
      })

      // Instagram
      .addCase(fetchInstagramFeed.pending, (state) => {
        state.instagramLoading = true;
      })
      .addCase(fetchInstagramFeed.fulfilled, (state, action) => {
        state.instagramLoading = false;
        state.instagramFeed = (action.payload.data || []).map(item => ({
          ...item,
          id: item._id,
          image: item.mediaUrl || item.thumbnailUrl || item.image || null,
          link: item.permalink || item.link || '#',
        }));
      })
      .addCase(fetchInstagramFeed.rejected, (state) => {
        state.instagramLoading = false;
        state.instagramFeed = [];
      });
  }
});

export default commonAdsSlice.reducer;
