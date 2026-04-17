import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import AdminLayout from '../components/layout/Layout'

import Login from '../pages/Login'
import Setup from '../pages/Setup'
import Dashboard from '../pages/Dashboard'
import NotFound from '../pages/NotFound'

// News
import NewsList from '../pages/news/NewsList'
import NewsCategories from '../pages/news/NewsCategories'
import BreakingPointsManager from '../pages/news/BreakingPointsManager'

// Jobs
import JobsList from '../pages/jobs/JobsList'
import JobsCategories from '../pages/jobs/JobsCategories'
import JobsLocations from '../pages/jobs/JobsLocations'

// Results
import ResultsList from '../pages/results/ResultsList'
import ResultsCategories from '../pages/results/ResultsCategories'

// Sports
import SportsList from '../pages/sports/SportsList'
import SportsCategories from '../pages/sports/SportsCategories'

// Foods
import FoodsList from '../pages/foods/FoodsList'

// History
import HistoryList from '../pages/history/HistoryList'

// Stays
import StaysList from '../pages/stays/StaysList'

// Events
import EventsList from '../pages/events/EventsList'
import EventsCategories from '../pages/events/EventsCategories'

// Movies
import MoviesList from '../pages/movies/MoviesList'
import TheatresManager from '../pages/movies/TheatresManager'

// Transport
import TransportList from '../pages/transport/TransportList'

// Offers
import OffersList from '../pages/offers/OffersList'

// Tourism
import TourismList from '../pages/tourism/TourismList'
import TourismCategories from '../pages/tourism/TourismCategories'
import TourismLocations from '../pages/tourism/TourismLocations'

// Real Estate
import RealEstateList from '../pages/realestate/RealEstateList'
import RealEstateLocations from '../pages/realestate/RealEstateLocations'
import RealEstatePropertyTypes from '../pages/realestate/RealEstatePropertyTypes'

// Updates
import UpdatesList from '../pages/updates/UpdatesList'
import UpdatesCategories from '../pages/updates/UpdatesCategories'

// Ads
import AdsList from '../pages/ads/AdsList'

// Sponsorships
import SponsorshipsList from '../pages/sponsorships/SponsorshipsList'

// Instagram
import InstagramManager from '../pages/instagram/InstagramManager'

// Activity (Superadmin only — RULE 18)
import ActivityLog from '../pages/ActivityLog'

// Recycle Bin
import RecycleBin from '../pages/RecycleBin'

// Profile
import ProfilePage from '../pages/profile/ProfilePage'

// Leads
import LeadsList from '../pages/leads/LeadsList'

// Users (Superadmin only — RULE 18)
import UsersList from '../pages/users/UsersList'

// Roles (Superadmin only — RULE 18)
import RolesList from '../pages/roles/RolesList'

// Company
import CompanySettings from '../pages/company/CompanySettings'

// Onboarding
import OnboardingCompany from '../pages/onboarding/OnboardingCompany'
import OnboardingInstagram from '../pages/onboarding/OnboardingInstagram'
import OnboardingAds from '../pages/onboarding/OnboardingAds'

/** Standard protected route — any authenticated user */
function PL({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

/** Superadmin-only protected route — RULE 18 */
function PLAdmin({ children }) {
  return (
    <ProtectedRoute requireSuperAdmin>
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

      {/* News — RULE 12: all create/edit via modals on list page */}
      <Route path="/news/list"            element={<PL><NewsList /></PL>} />
      <Route path="/news/create"          element={<Navigate to="/news/list" replace />} />
      <Route path="/news/update/:id"      element={<Navigate to="/news/list" replace />} />
      <Route path="/news/categories"      element={<PL><NewsCategories /></PL>} />
      <Route path="/news/breaking-points" element={<PL><BreakingPointsManager /></PL>} />

      {/* Jobs — RULE 12: all create/edit via modals on list page */}
      <Route path="/jobs/list"       element={<PL><JobsList /></PL>} />
      <Route path="/jobs/create"     element={<Navigate to="/jobs/list" replace />} />
      <Route path="/jobs/update/:id" element={<Navigate to="/jobs/list" replace />} />
      <Route path="/jobs/categories" element={<PL><JobsCategories /></PL>} />
      <Route path="/jobs/locations"  element={<PL><JobsLocations /></PL>} />

      {/* Results — RULE 12: all create/edit via modals on list page */}
      <Route path="/results/list"       element={<PL><ResultsList /></PL>} />
      <Route path="/results/create"     element={<Navigate to="/results/list" replace />} />
      <Route path="/results/update/:id" element={<Navigate to="/results/list" replace />} />
      <Route path="/results/categories" element={<PL><ResultsCategories /></PL>} />

      {/* Sports — RULE 12: all create/edit via modals on list page */}
      <Route path="/sports/list"       element={<PL><SportsList /></PL>} />
      <Route path="/sports/create"     element={<Navigate to="/sports/list" replace />} />
      <Route path="/sports/update/:id" element={<Navigate to="/sports/list" replace />} />
      <Route path="/sports/categories" element={<PL><SportsCategories /></PL>} />

      {/* Foods */}
      <Route path="/foods" element={<PL><FoodsList /></PL>} />

      {/* History */}
      <Route path="/history" element={<PL><HistoryList /></PL>} />

      {/* Stays — RULE 12: all create/edit via modals on list page */}
      <Route path="/stays/list"       element={<PL><StaysList /></PL>} />
      <Route path="/stays/create"     element={<Navigate to="/stays/list" replace />} />
      <Route path="/stays/update/:id" element={<Navigate to="/stays/list" replace />} />

      {/* Events — RULE 12: all create/edit via modals on list page */}
      <Route path="/events/list"       element={<PL><EventsList /></PL>} />
      <Route path="/events/create"     element={<Navigate to="/events/list" replace />} />
      <Route path="/events/update/:id" element={<Navigate to="/events/list" replace />} />
      <Route path="/events/categories" element={<PL><EventsCategories /></PL>} />

      {/* Movies */}
      <Route path="/movies/list"     element={<PL><MoviesList /></PL>} />
      <Route path="/movies/theatres" element={<PL><TheatresManager /></PL>} />

      {/* Transport — RULE 12: all create/edit via modals on list page */}
      <Route path="/transport/list"       element={<PL><TransportList /></PL>} />
      <Route path="/transport/create"     element={<Navigate to="/transport/list" replace />} />
      <Route path="/transport/update/:id" element={<Navigate to="/transport/list" replace />} />

      {/* Offers — RULE 12: all create/edit via modals on list page */}
      <Route path="/offers/list"       element={<PL><OffersList /></PL>} />
      <Route path="/offers/create"     element={<Navigate to="/offers/list" replace />} />
      <Route path="/offers/update/:id" element={<Navigate to="/offers/list" replace />} />

      {/* Tourism — RULE 12: all create/edit via modals on list page */}
      <Route path="/tourism/list"       element={<PL><TourismList /></PL>} />
      <Route path="/tourism/create"     element={<Navigate to="/tourism/list" replace />} />
      <Route path="/tourism/update/:id" element={<Navigate to="/tourism/list" replace />} />
      <Route path="/tourism/categories" element={<PL><TourismCategories /></PL>} />
      <Route path="/tourism/locations"  element={<PL><TourismLocations /></PL>} />

      {/* Real Estate — RULE 12: all create/edit via modals on list page */}
      <Route path="/realestate/list"           element={<PL><RealEstateList /></PL>} />
      <Route path="/realestate/create"         element={<Navigate to="/realestate/list" replace />} />
      <Route path="/realestate/update/:id"     element={<Navigate to="/realestate/list" replace />} />
      <Route path="/realestate/locations"      element={<PL><RealEstateLocations /></PL>} />
      <Route path="/realestate/property-types" element={<PL><RealEstatePropertyTypes /></PL>} />

      {/* Updates — RULE 12: all create/edit via modals on list page */}
      <Route path="/updates/list"       element={<PL><UpdatesList /></PL>} />
      <Route path="/updates/create"     element={<Navigate to="/updates/list" replace />} />
      <Route path="/updates/update/:id" element={<Navigate to="/updates/list" replace />} />
      <Route path="/updates/categories" element={<PL><UpdatesCategories /></PL>} />

      {/* Ads — RULE 12: all create/edit via modals on list page */}
      <Route path="/ads/list"       element={<PL><AdsList /></PL>} />
      <Route path="/ads/create"     element={<Navigate to="/ads/list" replace />} />
      <Route path="/ads/update/:id" element={<Navigate to="/ads/list" replace />} />

      {/* Sponsorships — RULE 12: all create/edit via modals on list page */}
      <Route path="/sponsorships/list"       element={<PL><SponsorshipsList /></PL>} />
      <Route path="/sponsorships/create"     element={<Navigate to="/sponsorships/list" replace />} />
      <Route path="/sponsorships/update/:id" element={<Navigate to="/sponsorships/list" replace />} />

      {/* Instagram */}
      <Route path="/instagram" element={<PL><InstagramManager /></PL>} />

      {/* Leads */}
      <Route path="/leads" element={<PL><LeadsList /></PL>} />

      {/* Company */}
      <Route path="/company" element={<PL><CompanySettings /></PL>} />

      {/* Users — Superadmin only (RULE 18) */}
      <Route path="/users/list"       element={<PLAdmin><UsersList /></PLAdmin>} />
      <Route path="/users/create"     element={<Navigate to="/users/list" replace />} />
      <Route path="/users/update/:id" element={<Navigate to="/users/list" replace />} />

      {/* Roles — Superadmin only (RULE 18) */}
      <Route path="/roles/list"       element={<PLAdmin><RolesList /></PLAdmin>} />
      <Route path="/roles/create"     element={<Navigate to="/roles/list" replace />} />
      <Route path="/roles/update/:id" element={<Navigate to="/roles/list" replace />} />

      {/* Settings → redirect to Company */}
      <Route path="/settings"            element={<Navigate to="/company" replace />} />
      <Route path="/settings/audit-logs" element={<Navigate to="/activity" replace />} />

      {/* Activity — Superadmin only (RULE 18) */}
      <Route path="/activity" element={<PLAdmin><ActivityLog /></PLAdmin>} />

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
      <Route path="/realestate"   element={<Navigate to="/realestate/list" replace />} />
      <Route path="/settings/admins" element={<Navigate to="/users/list" replace />} />
      <Route path="/users"        element={<Navigate to="/users/list" replace />} />
      <Route path="/roles"        element={<Navigate to="/roles/list" replace />} />

      <Route path="*" element={<PL><NotFound /></PL>} />
    </Routes>
  )
}
