import axios from "axios";
import { getToken } from "firebase/app-check";
import { appCheck } from "../config/firebase";

export const validateItem = (item) => {
  if (!item || !item._id) return false;
  const name =
    item.title       || item.name        || item.movieName  ||
    item.foodName    || item.hotelName   || item.placeName  ||
    item.examName    || item.sponsorName || item.caption    ||
    item.eraName     || item.trainName   || item.routeName  ||
    item.serviceName || item.airportName || item.text       ||
    item.venueName;
  if (!name && import.meta.env.DEV) {
    console.warn("[API Validation] Dropped invalid item:", item);
  }
  return !!name;
};

const normalizeResponse = (response) => {
  const { data, success, pagination } = response.data || {};
  return {
    success: !!success,
    data: Array.isArray(data) ? data.filter(validateItem) : (data || null),
    pagination: pagination || null,
    message: response.data?.message || "",
  };
};

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, ""),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const { token } = await getToken(appCheck, false)
    if (token) config.headers["X-Firebase-AppCheck"] = token
  } catch { /* non-blocking */ }
  return config
})

apiClient.interceptors.response.use(
  (response) => normalizeResponse(response),
  (error) => Promise.reject({
    success: false,
    data: null,
    message: error.response?.data?.message || error.message || "An unexpected error occurred",
    status: error.response?.status,
  })
);

export default apiClient;
