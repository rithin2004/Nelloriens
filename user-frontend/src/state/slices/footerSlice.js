import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

/**
 * Fetch Footer Data
 * Integrated with production REST API (§8)
 */
export const fetchFooterData = createAsyncThunk(
  "footer/fetchFooterData",
  async (_, { rejectWithValue, signal }) => {
    try {
      // Endpoint mapped from production guide §8
      const response = await apiClient.get("/company/get", { signal });
      return response.data; // apiClient normalization handles the envelope
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  data: {
    logo: null,
    siteName: null,
    tagline: null,
    email: null,
    phones: [],
    location: null,
    socialLinks: [],
    quickLinks: {
      column1: [
        { labelKey: "Jobs", path: "/jobs" },
        { labelKey: "LatestNews", path: "/news" },
        { labelKey: "ExamResults", path: "/results" },
        { labelKey: "UpdatesInfo", path: "/updates" },
      ],
      column2: [
        { labelKey: "Notifications", path: "/notifications" },
        { labelKey: "SportsNews", path: "/sports" },
        { labelKey: "Offers", path: "/offers" },
        { labelKey: "Articles", path: "/articles" },
      ],
      column3: [
        { labelKey: "Tourism", path: "/tourism" },
        { labelKey: "FamousStay", path: "/famousstay" },
        { labelKey: "FamousFoods", path: "/famousfood" },
        { labelKey: "Events", path: "/events" },
      ],
      column4: [
        { labelKey: "History", path: "/history" },
        { labelKey: "Movies", path: "/movies" },
        { labelKey: "Transport", path: "/transport" },
        { labelKey: "ContactUs", path: "/contact" },
        { labelKey: "AboutUs", path: "/about" },
      ]
    }
  },
  status: "idle",
  error: null
};

const footerSlice = createSlice({
  name: "footer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFooterData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFooterData.fulfilled, (state, action) => {
        state.status = "succeeded";
        const api = action.payload;
        if (!api) return;

        const ICON_MAP = {
          facebook: 'FaFacebook', twitter: 'FaTwitter', instagram: 'FaInstagram',
          youtube: 'FaYoutube', linkedin: 'FaLinkedin', whatsapp: 'FaWhatsapp',
          telegram: 'FaTelegramPlane',
        };

        const socialLinks = api.socialLinks && typeof api.socialLinks === 'object' && !Array.isArray(api.socialLinks)
          ? Object.entries(api.socialLinks)
              .filter(([, url]) => !!url)
              .map(([platform, url]) => ({ platform, url, icon: ICON_MAP[platform] || 'FaGlobe' }))
          : (api.socialLinks || state.data.socialLinks);

        state.data = {
          ...state.data,
          siteName: api.name || null,
          logo: api.logoUrl || null,
          email: api.email || api.contactEmail || null,
          phones: api.phone ? [api.phone] : (api.phones || []),
          location: api.location || null,
          socialLinks,
          quickLinks: state.data.quickLinks,
        };
      })
      .addCase(fetchFooterData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default footerSlice.reducer;
