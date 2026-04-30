import { lazy, Suspense, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { MainContentArea } from "./components/ContentSections";
import Footer from "./components/Footer";
import MainHeader from "./components/MainHeader";
import Navbar from "./components/Navbar";
import TopHeader from "./components/TopHeader";
import BrandingManager from "./components/BrandingManager";
import Carousel from "./Layout/CustomHeader/Carousel";
import useSSE from "./hooks/useSSE";
import { fetchFooterData } from "./state/slices/footerSlice";
import { fetchBreakingPoints } from "./state/slices/newsSlice";

const ContactUs       = lazy(() => import("./Pages/ContactUs.jsx"));
const EventsPage      = lazy(() => import("./Pages/EventsPage.jsx"));
const Famousfood      = lazy(() => import("./Pages/Famousfood.jsx"));
const FamousstayPage  = lazy(() => import("./Pages/FamousStayPage.jsx"));
const HistoryPage     = lazy(() => import("./Pages/HistoryPage.jsx"));
const JobsPage        = lazy(() => import("./Pages/JobsPage.jsx"));
const MoviesPage      = lazy(() => import("./Pages/MoviesPage.jsx"));
const NewsPage        = lazy(() => import("./Pages/NewsPage.jsx"));
const UpdatesPage      = lazy(() => import("./Pages/UpdatesPage.jsx"));
const OffersPage      = lazy(() => import("./Pages/OffersPage.jsx"));
const RealEstate      = lazy(() => import("./Pages/RealEstate.jsx"));
const ResultsPage     = lazy(() => import("./Pages/ResultsPage.jsx"));
const SportsPage      = lazy(() => import("./Pages/SportsPage.jsx"));
const TourismPage     = lazy(() => import("./Pages/TourismPage.jsx"));
const TransportPage   = lazy(() => import("./Pages/TransportPage.jsx"));

function HomePage() {
  return (
    <div>
      <TopHeader />
      <MainHeader />
      <Navbar />
      <Carousel />
      <MainContentArea />
      <Footer />
    </div>
  );
}

function App() {
  useSSE();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchFooterData());
    dispatch(fetchBreakingPoints());
  }, [dispatch]);
  return (
    <ErrorBoundary>
      <BrandingManager />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" /></div>}>
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/news"           element={<NewsPage />} />
          <Route path="/news/:id"       element={<NewsPage />} />
          <Route path="/jobs"           element={<JobsPage />} />
          <Route path="/results"        element={<ResultsPage />} />
          <Route path="/history"        element={<HistoryPage />} />
          <Route path="/updates"        element={<UpdatesPage />} />
          <Route path="/offers"         element={<OffersPage />} />
          <Route path="/tourism"        element={<TourismPage />} />
          <Route path="/famousstay"     element={<FamousstayPage />} />
          <Route path="/famous-foods"   element={<Famousfood />} />
          <Route path="/events"         element={<EventsPage />} />
          <Route path="/sports"         element={<SportsPage />} />
          <Route path="/movies"         element={<MoviesPage />} />
          <Route path="/transport"      element={<TransportPage />} />
          <Route path="/contact"        element={<ContactUs />} />
          <Route path="/real-estate"    element={<RealEstate />} />


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
