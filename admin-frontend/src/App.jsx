import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminLayout from './components/layout/Layout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// News
import NewsList from './pages/news/NewsList'
import NewsCreate from './pages/news/NewsCreate'
import NewsEdit from './pages/news/NewsEdit'
import NewsCategories from './pages/news/NewsCategories'
import BreakingPointsManager from './pages/news/BreakingPointsManager'

// Jobs
import JobsList from './pages/jobs/JobsList'
import JobsCreate from './pages/jobs/JobsCreate'
import JobsEdit from './pages/jobs/JobsEdit'
import JobsCategories from './pages/jobs/JobsCategories'
import JobsLocations from './pages/jobs/JobsLocations'

// Results
import ResultsList from './pages/results/ResultsList'
import ResultsCreate from './pages/results/ResultsCreate'
import ResultsEdit from './pages/results/ResultsEdit'
import ResultsCategories from './pages/results/ResultsCategories'

// Sports
import SportsList from './pages/sports/SportsList'
import SportsCreate from './pages/sports/SportsCreate'
import SportsEdit from './pages/sports/SportsEdit'
import SportsCategories from './pages/sports/SportsCategories'

// Foods
import FoodsList from './pages/foods/FoodsList'

// History
import HistoryList from './pages/history/HistoryList'

// Stays
import StaysList from './pages/stays/StaysList'
import StaysCreate from './pages/stays/StaysCreate'
import StaysEdit from './pages/stays/StaysEdit'

// Events
import EventsList from './pages/events/EventsList'
import EventsCreate from './pages/events/EventsCreate'
import EventsEdit from './pages/events/EventsEdit'
import EventsCategories from './pages/events/EventsCategories'

// Movies
import MoviesList from './pages/movies/MoviesList'
import TheatresManager from './pages/movies/TheatresManager'

// Transport
import TransportList from './pages/transport/TransportList'
import TransportCreate from './pages/transport/TransportCreate'
import TransportEdit from './pages/transport/TransportEdit'
import TransportCategories from './pages/transport/TransportCategories'

// Offers
import OffersList from './pages/offers/OffersList'
import OffersCreate from './pages/offers/OffersCreate'
import OffersEdit from './pages/offers/OffersEdit'

// Tourism
import TourismList from './pages/tourism/TourismList'
import TourismCreate from './pages/tourism/TourismCreate'
import TourismEdit from './pages/tourism/TourismEdit'
import TourismCategories from './pages/tourism/TourismCategories'

// Contact
import ContactSettings from './pages/contact/ContactSettings'

// Updates
import UpdatesList from './pages/updates/UpdatesList'
import UpdatesCreate from './pages/updates/UpdatesCreate'
import UpdatesEdit from './pages/updates/UpdatesEdit'
import UpdatesCategories from './pages/updates/UpdatesCategories'

// Ads
import AdsList from './pages/ads/AdsList'
import AdsCreate from './pages/ads/AdsCreate'
import AdsEdit from './pages/ads/AdsEdit'

// Sponsorships
import SponsorshipsList from './pages/sponsorships/SponsorshipsList'
import SponsorshipsCreate from './pages/sponsorships/SponsorshipsCreate'
import SponsorshipsEdit from './pages/sponsorships/SponsorshipsEdit'

// Instagram
import InstagramManager from './pages/instagram/InstagramManager'

// Profile
import ProfilePage from './pages/profile/ProfilePage'

// Leads
import LeadsList from './pages/leads/LeadsList'

// Settings
import Settings from './pages/settings/Settings'
import AdminUsers from './pages/settings/AdminUsers'
import AuditLogs from './pages/settings/AuditLogs'

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#FFFFFF', color: '#0F172A', border: '1px solid #dce8fb', borderRadius: '10px', fontSize: '14px', boxShadow: '0 8px 24px rgba(10,61,149,0.12)' },
          success: { iconTheme: { primary: '#16A34A', secondary: '#FFFFFF' } },
          error:   { iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />

        {/* News — static routes MUST come before dynamic /:id routes */}
        <Route path="/news/list"             element={<ProtectedLayout><NewsList /></ProtectedLayout>} />
        <Route path="/news/create"           element={<ProtectedLayout><NewsCreate /></ProtectedLayout>} />
        <Route path="/news/categories"       element={<ProtectedLayout><NewsCategories /></ProtectedLayout>} />
        <Route path="/news/breaking-points"  element={<ProtectedLayout><BreakingPointsManager /></ProtectedLayout>} />
        <Route path="/news/update/:id"       element={<ProtectedLayout><NewsEdit /></ProtectedLayout>} />

        {/* Jobs */}
        <Route path="/jobs/list"       element={<ProtectedLayout><JobsList /></ProtectedLayout>} />
        <Route path="/jobs/create"     element={<ProtectedLayout><JobsCreate /></ProtectedLayout>} />
        <Route path="/jobs/categories" element={<ProtectedLayout><JobsCategories /></ProtectedLayout>} />
        <Route path="/jobs/locations"  element={<ProtectedLayout><JobsLocations /></ProtectedLayout>} />
        <Route path="/jobs/update/:id" element={<ProtectedLayout><JobsEdit /></ProtectedLayout>} />

        {/* Results */}
        <Route path="/results/list"         element={<ProtectedLayout><ResultsList /></ProtectedLayout>} />
        <Route path="/results/create"       element={<ProtectedLayout><ResultsCreate /></ProtectedLayout>} />
        <Route path="/results/categories"   element={<ProtectedLayout><ResultsCategories /></ProtectedLayout>} />
        <Route path="/results/update/:id"   element={<ProtectedLayout><ResultsEdit /></ProtectedLayout>} />

        {/* Sports */}
        <Route path="/sports/list"        element={<ProtectedLayout><SportsList /></ProtectedLayout>} />
        <Route path="/sports/create"      element={<ProtectedLayout><SportsCreate /></ProtectedLayout>} />
        <Route path="/sports/categories"  element={<ProtectedLayout><SportsCategories /></ProtectedLayout>} />
        <Route path="/sports/update/:id"  element={<ProtectedLayout><SportsEdit /></ProtectedLayout>} />

        {/* Foods — single management page */}
        <Route path="/foods"  element={<ProtectedLayout><FoodsList /></ProtectedLayout>} />

        {/* History — single management page */}
        <Route path="/history"  element={<ProtectedLayout><HistoryList /></ProtectedLayout>} />

        {/* Stays */}
        <Route path="/stays/list"       element={<ProtectedLayout><StaysList /></ProtectedLayout>} />
        <Route path="/stays/create"     element={<ProtectedLayout><StaysCreate /></ProtectedLayout>} />
        <Route path="/stays/update/:id" element={<ProtectedLayout><StaysEdit /></ProtectedLayout>} />

        {/* Events */}
        <Route path="/events/list"        element={<ProtectedLayout><EventsList /></ProtectedLayout>} />
        <Route path="/events/create"      element={<ProtectedLayout><EventsCreate /></ProtectedLayout>} />
        <Route path="/events/categories"  element={<ProtectedLayout><EventsCategories /></ProtectedLayout>} />
        <Route path="/events/update/:id"  element={<ProtectedLayout><EventsEdit /></ProtectedLayout>} />

        {/* Movies — single management page */}
        <Route path="/movies/list"      element={<ProtectedLayout><MoviesList /></ProtectedLayout>} />
        <Route path="/movies/theatres"  element={<ProtectedLayout><TheatresManager /></ProtectedLayout>} />

        {/* Transport */}
        <Route path="/transport/list"        element={<ProtectedLayout><TransportList /></ProtectedLayout>} />
        <Route path="/transport/create"      element={<ProtectedLayout><TransportCreate /></ProtectedLayout>} />
        <Route path="/transport/categories"  element={<ProtectedLayout><TransportCategories /></ProtectedLayout>} />
        <Route path="/transport/update/:id"  element={<ProtectedLayout><TransportEdit /></ProtectedLayout>} />

        {/* Offers */}
        <Route path="/offers/list"       element={<ProtectedLayout><OffersList /></ProtectedLayout>} />
        <Route path="/offers/create"     element={<ProtectedLayout><OffersCreate /></ProtectedLayout>} />
        <Route path="/offers/update/:id" element={<ProtectedLayout><OffersEdit /></ProtectedLayout>} />

        {/* Tourism */}
        <Route path="/tourism/list"        element={<ProtectedLayout><TourismList /></ProtectedLayout>} />
        <Route path="/tourism/create"      element={<ProtectedLayout><TourismCreate /></ProtectedLayout>} />
        <Route path="/tourism/categories"  element={<ProtectedLayout><TourismCategories /></ProtectedLayout>} />
        <Route path="/tourism/update/:id"  element={<ProtectedLayout><TourismEdit /></ProtectedLayout>} />

        {/* Contact */}
        <Route path="/contact/list"   element={<ProtectedLayout><ContactSettings /></ProtectedLayout>} />
        <Route path="/contact/update" element={<ProtectedLayout><ContactSettings /></ProtectedLayout>} />

        {/* Updates */}
        <Route path="/updates/list"        element={<ProtectedLayout><UpdatesList /></ProtectedLayout>} />
        <Route path="/updates/create"      element={<ProtectedLayout><UpdatesCreate /></ProtectedLayout>} />
        <Route path="/updates/categories"  element={<ProtectedLayout><UpdatesCategories /></ProtectedLayout>} />
        <Route path="/updates/update/:id"  element={<ProtectedLayout><UpdatesEdit /></ProtectedLayout>} />

        {/* Ads */}
        <Route path="/ads/list"       element={<ProtectedLayout><AdsList /></ProtectedLayout>} />
        <Route path="/ads/create"     element={<ProtectedLayout><AdsCreate /></ProtectedLayout>} />
        <Route path="/ads/update/:id" element={<ProtectedLayout><AdsEdit /></ProtectedLayout>} />

        {/* Sponsorships */}
        <Route path="/sponsorships/list"       element={<ProtectedLayout><SponsorshipsList /></ProtectedLayout>} />
        <Route path="/sponsorships/create"     element={<ProtectedLayout><SponsorshipsCreate /></ProtectedLayout>} />
        <Route path="/sponsorships/update/:id" element={<ProtectedLayout><SponsorshipsEdit /></ProtectedLayout>} />

        {/* Instagram */}
        <Route path="/instagram" element={<ProtectedLayout><InstagramManager /></ProtectedLayout>} />

        {/* Leads */}
        <Route path="/leads" element={<ProtectedLayout><LeadsList /></ProtectedLayout>} />

        {/* Settings */}
        <Route path="/settings"             element={<ProtectedLayout><Settings /></ProtectedLayout>} />
        <Route path="/settings/admins"      element={<ProtectedLayout><AdminUsers /></ProtectedLayout>} />
        <Route path="/settings/audit-logs"  element={<ProtectedLayout><AuditLogs /></ProtectedLayout>} />

        {/* Profile */}
        <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />

        {/* Legacy redirects — keep old URLs working */}
        <Route path="/news"         element={<Navigate to="/news/list" replace />} />
        <Route path="/jobs"         element={<Navigate to="/jobs/list" replace />} />
        <Route path="/results"      element={<Navigate to="/results/list" replace />} />
        <Route path="/sports"       element={<Navigate to="/sports/list" replace />} />
        <Route path="/stays"        element={<Navigate to="/stays/list" replace />} />
        <Route path="/events"       element={<Navigate to="/events/list" replace />} />
        <Route path="/movies"       element={<Navigate to="/movies/list" replace />} />
        <Route path="/transport"    element={<Navigate to="/transport/list" replace />} />
        <Route path="/offers"       element={<Navigate to="/offers/list" replace />} />
        <Route path="/tourism"      element={<Navigate to="/tourism/list" replace />} />
        <Route path="/updates"      element={<Navigate to="/updates/list" replace />} />
        <Route path="/ads"          element={<Navigate to="/ads/list" replace />} />
        <Route path="/sponsorships" element={<Navigate to="/sponsorships/list" replace />} />
        <Route path="/contact"      element={<Navigate to="/contact/list" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
