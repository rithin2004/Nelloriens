import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import commonAdsReducer from "./slices/commonAdsSlice";
import contactReducer from "./slices/contactSlice";
import eventsReducer from "./slices/eventsSlice";
import famousFoodsReducer from "./slices/famousFoodsSlice";
import famousStaysReducer from "./slices/famousStaysSlice";
import historyReducer from "./slices/historySlice";
import homepageReducer from "./slices/homepageSlice";
import newsReducer from "./slices/newsSlice";
import jobsReducer from "./slices/jobsSlice";
import notificationReducer from "./slices/notificationSlice";
import offersReducer from "./slices/offersSlice";
import realEstateReducer from "./slices/realEstateSlice";
import resultsReducer from "./slices/resultsSlice";
import sportsReducer from "./slices/sportsSlice";
import moviesReducer from "./slices/moviesSlice";
import footerReducer from "./slices/footerSlice";
import transportReducer from "./slices/transportSlice";
import tourismReducer from "./slices/tourismSlice";
import searchReducer from "./slices/searchSlice";

const loggerMiddleware = () => (next) => (action) => {
  if (action.type.endsWith("/rejected")) {
    const err = action.payload || action.error;
    if (err?.message !== "stale_request" && err !== "stale_request") {
      console.error(`[API ERROR] ${action.type}`, err);
    }
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    app: appReducer,
    news: newsReducer,
    jobs: jobsReducer,
    homepage: homepageReducer,
    results: resultsReducer,
    realEstate: realEstateReducer,
    notifications: notificationReducer,
    famousStays: famousStaysReducer,
    famousFoods: famousFoodsReducer,
    events: eventsReducer,
    sports: sportsReducer,
    history: historyReducer,
    commonAds: commonAdsReducer,
    contact: contactReducer,
    transport: transportReducer,
    movies: moviesReducer,
    offers: offersReducer,
    footer: footerReducer,
    tourism: tourismReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware),
});
