import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import AdminLayout from '../components/layout/Layout'

import Login from '../pages/Login'
import Setup from '../pages/Setup'
import Dashboard from '../pages/Dashboard'
import NotFound from '../pages/NotFound'

// News
import NewsList from '../pages/news/NewsList'
import NewsCreate from '../pages/news/NewsCreate'
import NewsEdit from '../pages/news/NewsEdit'
import NewsCategories from '../pages/news/NewsCategories'
import BreakingPointsManager from '../pages/news/BreakingPointsManager'

// Jobs
import JobsList from '../pages/jobs/JobsList'
import JobsCreate from '../pages/jobs/JobsCreate'
import JobsEdit from '../pages/jobs/JobsEdit'
import JobsCategories from '../pages/jobs/JobsCategories'
import JobsLocations from '../pages/jobs/JobsLocations'

// Results
import ResultsList from '../pages/results/ResultsList'
import ResultsCreate from '../pages/results/ResultsCreate'
import ResultsEdit from '../pages/results/ResultsEdit'
import ResultsCategories from '../pages/results/ResultsCategories'

// Sports
import SportsList from '../pages/sports/SportsList'
import SportsCreate from '../pages/sports/SportsCreate'
import SportsEdit from '../pages/sports/SportsEdit'
import SportsCategories from '../pages/sports/SportsCategories'

// Foods
import FoodsList from '../pages/foods/FoodsList'

// History
import HistoryList from '../pages/history/HistoryList'

// Stays
import StaysList from '../pages/stays/StaysList'
import StaysCreate from '../pages/stays/StaysCreate'
import StaysEdit from '../pages/stays/StaysEdit'

// Events
import EventsList from '../pages/events/EventsList'
import EventsCreate from '../pages/events/EventsCreate'
import EventsEdit from '../pages/events/EventsEdit'
import EventsCategories from '../pages/events/EventsCategories'

// Movies
import MoviesList from '../pages/movies/MoviesList'
import TheatresManager from '../pages/movies/TheatresManager'

// Transport
import TransportList from '../pages/transport/TransportList'
import TransportCreate from '../pages/transport/TransportCreate'
import TransportEdit from '../pages/transport/TransportEdit'
import TransportCategories from '../pages/transport/TransportCategories'

// Offers
import OffersList from '../pages/offers/OffersList'
import OffersCreate from '../pages/offers/OffersCreate'
import OffersEdit from '../pages/offers/OffersEdit'

// Tourism
import TourismList from '../pages/tourism/TourismList'
import TourismCreate from '../pages/tourism/TourismCreate'
import TourismEdit from '../pages/tourism/TourismEdit'
import TourismCategories from '../pages/tourism/TourismCategories'

// Updates
import UpdatesList from '../pages/updates/UpdatesList'
import UpdatesCreate from '../pages/updates/UpdatesCreate'
import UpdatesEdit from '../pages/updates/UpdatesEdit'
import UpdatesCategories from '../pages/updates/UpdatesCategories'

// Ads
import AdsList from '../pages/ads/AdsList'
import AdsCreate from '../pages/ads/AdsCreate'
import AdsEdit from '../pages/ads/AdsEdit'

// Sponsorships
import SponsorshipsList from '../pages/sponsorships/SponsorshipsList'
import SponsorshipsCreate from '../pages/sponsorships/SponsorshipsCreate'
import SponsorshipsEdit from '../pages/sponsorships/SponsorshipsEdit'

// Instagram
import InstagramManager from '../pages/instagram/InstagramManager'

// Activity
import ActivityLog from '../pages/ActivityLog'

// Recycle Bin
import RecycleBin from '../pages/RecycleBin'

// Profile
import ProfilePage from '../pages/profile/ProfilePage'

// Leads
import LeadsList from '../pages/leads/LeadsList'


// Users
import UsersList from '../pages/users/UsersList'

// Roles
import RolesList from '../pages/roles/RolesList'

// Company
import CompanySettings from '../pages/company/CompanySettings'

// Onboarding
import OnboardingCompany from '../pages/onboarding/OnboardingCompany'
import OnboardingInstagram from '../pages/onboarding/OnboardingInstagram'
import OnboardingAds from '../pages/onboarding/OnboardingAds'

function PL({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Onboarding */}
      <Route path="/onboarding/company"   element={<PL><OnboardingCompany /></PL>} />
      <Route path="/onboarding/instagram" element={<PL><OnboardingInstagram /></PL>} />
      <Route path="/onboarding/ads"       element={<PL><OnboardingAds /></PL>} />

      <Route path="/dashboard" element={<PL><Dashboard /></PL>} />

      {/* News */}
      <Route path="/news/list"            element={<PL><NewsList /></PL>} />
      <Route path="/news/create"          element={<PL><NewsCreate /></PL>} />
      <Route path="/news/categories"      element={<PL><NewsCategories /></PL>} />
      <Route path="/news/breaking-points" element={<PL><BreakingPointsManager /></PL>} />
      <Route path="/news/update/:id"      element={<PL><NewsEdit /></PL>} />

      {/* Jobs */}
      <Route path="/jobs/list"       element={<PL><JobsList /></PL>} />
      <Route path="/jobs/create"     element={<PL><JobsCreate /></PL>} />
      <Route path="/jobs/categories" element={<PL><JobsCategories /></PL>} />
      <Route path="/jobs/locations"  element={<PL><JobsLocations /></PL>} />
      <Route path="/jobs/update/:id" element={<PL><JobsEdit /></PL>} />

      {/* Results */}
      <Route path="/results/list"       element={<PL><ResultsList /></PL>} />
      <Route path="/results/create"     element={<PL><ResultsCreate /></PL>} />
      <Route path="/results/categories" element={<PL><ResultsCategories /></PL>} />
      <Route path="/results/update/:id" element={<PL><ResultsEdit /></PL>} />

      {/* Sports */}
      <Route path="/sports/list"       element={<PL><SportsList /></PL>} />
      <Route path="/sports/create"     element={<PL><SportsCreate /></PL>} />
      <Route path="/sports/categories" element={<PL><SportsCategories /></PL>} />
      <Route path="/sports/update/:id" element={<PL><SportsEdit /></PL>} />

      {/* Foods */}
      <Route path="/foods" element={<PL><FoodsList /></PL>} />

      {/* History */}
      <Route path="/history" element={<PL><HistoryList /></PL>} />

      {/* Stays */}
      <Route path="/stays/list"       element={<PL><StaysList /></PL>} />
      <Route path="/stays/create"     element={<PL><StaysCreate /></PL>} />
      <Route path="/stays/update/:id" element={<PL><StaysEdit /></PL>} />

      {/* Events */}
      <Route path="/events/list"       element={<PL><EventsList /></PL>} />
      <Route path="/events/create"     element={<PL><EventsCreate /></PL>} />
      <Route path="/events/categories" element={<PL><EventsCategories /></PL>} />
      <Route path="/events/update/:id" element={<PL><EventsEdit /></PL>} />

      {/* Movies */}
      <Route path="/movies/list"     element={<PL><MoviesList /></PL>} />
      <Route path="/movies/theatres" element={<PL><TheatresManager /></PL>} />

      {/* Transport */}
      <Route path="/transport/list"       element={<PL><TransportList /></PL>} />
      <Route path="/transport/create"     element={<PL><TransportCreate /></PL>} />
      <Route path="/transport/categories" element={<PL><TransportCategories /></PL>} />
      <Route path="/transport/update/:id" element={<PL><TransportEdit /></PL>} />

      {/* Offers */}
      <Route path="/offers/list"       element={<PL><OffersList /></PL>} />
      <Route path="/offers/create"     element={<PL><OffersCreate /></PL>} />
      <Route path="/offers/update/:id" element={<PL><OffersEdit /></PL>} />

      {/* Tourism */}
      <Route path="/tourism/list"       element={<PL><TourismList /></PL>} />
      <Route path="/tourism/create"     element={<PL><TourismCreate /></PL>} />
      <Route path="/tourism/categories" element={<PL><TourismCategories /></PL>} />
      <Route path="/tourism/update/:id" element={<PL><TourismEdit /></PL>} />

      {/* Updates */}
      <Route path="/updates/list"       element={<PL><UpdatesList /></PL>} />
      <Route path="/updates/create"     element={<PL><UpdatesCreate /></PL>} />
      <Route path="/updates/categories" element={<PL><UpdatesCategories /></PL>} />
      <Route path="/updates/update/:id" element={<PL><UpdatesEdit /></PL>} />

      {/* Ads */}
      <Route path="/ads/list"       element={<PL><AdsList /></PL>} />
      <Route path="/ads/create"     element={<PL><AdsCreate /></PL>} />
      <Route path="/ads/update/:id" element={<PL><AdsEdit /></PL>} />

      {/* Sponsorships */}
      <Route path="/sponsorships/list"       element={<PL><SponsorshipsList /></PL>} />
      <Route path="/sponsorships/create"     element={<PL><SponsorshipsCreate /></PL>} />
      <Route path="/sponsorships/update/:id" element={<PL><SponsorshipsEdit /></PL>} />

      {/* Instagram */}
      <Route path="/instagram" element={<PL><InstagramManager /></PL>} />

      {/* Leads */}
      <Route path="/leads" element={<PL><LeadsList /></PL>} />

      {/* Company */}
      <Route path="/company" element={<PL><CompanySettings /></PL>} />

      {/* Users */}
      <Route path="/users/list"       element={<PL><UsersList /></PL>} />
      <Route path="/users/create"     element={<Navigate to="/users/list" replace />} />
      <Route path="/users/update/:id" element={<Navigate to="/users/list" replace />} />

      {/* Roles */}
      <Route path="/roles/list"       element={<PL><RolesList /></PL>} />
      <Route path="/roles/create"     element={<Navigate to="/roles/list" replace />} />
      <Route path="/roles/update/:id" element={<Navigate to="/roles/list" replace />} />

      {/* Settings → redirect to Company since GA ID moved there */}
      <Route path="/settings"            element={<Navigate to="/company" replace />} />
      <Route path="/settings/audit-logs" element={<Navigate to="/activity" replace />} />

      {/* Activity */}
      <Route path="/activity" element={<PL><ActivityLog /></PL>} />

      {/* Recycle Bin */}
      <Route path="/recycle-bin" element={<PL><RecycleBin /></PL>} />

      {/* Profile */}
      <Route path="/profile" element={<PL><ProfilePage /></PL>} />

      {/* Legacy redirects */}
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
      <Route path="/contact"      element={<Navigate to="/leads" replace />} />
      <Route path="/settings/admins" element={<Navigate to="/users/list" replace />} />
      <Route path="/users"        element={<Navigate to="/users/list" replace />} />
      <Route path="/roles"        element={<Navigate to="/roles/list" replace />} />

      <Route path="*" element={<PL><NotFound /></PL>} />
    </Routes>
  )
}
