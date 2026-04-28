import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import AdminLayout from '../components/layout/Layout'

// Always eager — shown before auth resolves, tiny files
import Login    from '../pages/Login'
import Setup    from '../pages/Setup'
import NotFound from '../pages/NotFound'

// Lazy-loaded — each becomes its own JS chunk, downloaded only when the route is first visited
const Dashboard             = lazy(() => import('../pages/Dashboard'))

const NewsList              = lazy(() => import('../pages/news/NewsList'))
const NewsManage            = lazy(() => import('../pages/news/NewsManage'))
const BreakingPointsManager = lazy(() => import('../pages/news/BreakingPointsManager'))

const JobsList    = lazy(() => import('../pages/jobs/JobsList'))
const JobsManage  = lazy(() => import('../pages/jobs/JobsManage'))

const ResultsList   = lazy(() => import('../pages/results/ResultsList'))
const ResultsManage = lazy(() => import('../pages/results/ResultsManage'))

const SportsList   = lazy(() => import('../pages/sports/SportsList'))
const SportsManage = lazy(() => import('../pages/sports/SportsManage'))

const FoodsList   = lazy(() => import('../pages/foods/FoodsList'))
const HistoryList = lazy(() => import('../pages/history/HistoryList'))

const StaysList   = lazy(() => import('../pages/stays/StaysList'))
const StaysManage = lazy(() => import('../pages/stays/StaysManage'))

const EventsList   = lazy(() => import('../pages/events/EventsList'))
const EventsManage = lazy(() => import('../pages/events/EventsManage'))

const MoviesList   = lazy(() => import('../pages/movies/MoviesList'))
const MoviesManage = lazy(() => import('../pages/movies/MoviesManage'))

const TransportList = lazy(() => import('../pages/transport/TransportList'))

const OffersList   = lazy(() => import('../pages/offers/OffersList'))
const OffersManage = lazy(() => import('../pages/offers/OffersManage'))

const TourismList   = lazy(() => import('../pages/tourism/TourismList'))
const TourismManage = lazy(() => import('../pages/tourism/TourismManage'))

const RealEstateList   = lazy(() => import('../pages/realestate/RealEstateList'))
const RealEstateManage = lazy(() => import('../pages/realestate/RealEstateManage'))

const UpdatesList   = lazy(() => import('../pages/updates/UpdatesList'))
const UpdatesManage = lazy(() => import('../pages/updates/UpdatesManage'))

const AdsList          = lazy(() => import('../pages/ads/AdsList'))
const SponsorshipsList = lazy(() => import('../pages/sponsorships/SponsorshipsList'))
const InstagramManager = lazy(() => import('../pages/instagram/InstagramManager'))

const ActivityLog = lazy(() => import('../pages/ActivityLog'))
const RecycleBin  = lazy(() => import('../pages/RecycleBin'))
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'))

const LeadsList   = lazy(() => import('../pages/leads/LeadsList'))
const LeadsManage = lazy(() => import('../pages/leads/LeadsManage'))

const UsersList = lazy(() => import('../pages/users/UsersList'))
const RolesList = lazy(() => import('../pages/roles/RolesList'))

const CompanySettings = lazy(() => import('../pages/company/CompanySettings'))

const OnboardingCompany   = lazy(() => import('../pages/onboarding/OnboardingCompany'))
const OnboardingInstagram = lazy(() => import('../pages/onboarding/OnboardingInstagram'))
const OnboardingAds       = lazy(() => import('../pages/onboarding/OnboardingAds'))

const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ minHeight: '100vh' }}>
      <div className="w-7 h-7 rounded-full animate-spin"
        style={{ border: '3px solid #dce8fb', borderTopColor: '#0a3d95' }} />
    </div>
  )
}

function PL({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

function PLAdmin({ children }) {
  return (
    <ProtectedRoute requireSuperAdmin>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Onboarding — protected but no layout (no sidebar/navbar during setup) */}
        <Route path="/onboarding/company"   element={<ProtectedRoute><OnboardingCompany /></ProtectedRoute>} />
        <Route path="/onboarding/instagram" element={<ProtectedRoute><OnboardingInstagram /></ProtectedRoute>} />
        <Route path="/onboarding/ads"       element={<ProtectedRoute><OnboardingAds /></ProtectedRoute>} />

        <Route path="/dashboard" element={<PL><Dashboard /></PL>} />

        {/* News */}
        <Route path="/news/list"            element={<PL><NewsList /></PL>} />
        <Route path="/news/create"          element={<Navigate to="/news/list" replace />} />
        <Route path="/news/update/:id"      element={<Navigate to="/news/list" replace />} />
        <Route path="/news/manage"          element={<PL><NewsManage /></PL>} />
        <Route path="/news/breaking-points" element={<PL><BreakingPointsManager /></PL>} />
        <Route path="/news/categories"      element={<Navigate to="/news/manage" replace />} />

        {/* Jobs */}
        <Route path="/jobs/list"       element={<PL><JobsList /></PL>} />
        <Route path="/jobs/create"     element={<Navigate to="/jobs/list" replace />} />
        <Route path="/jobs/update/:id" element={<Navigate to="/jobs/list" replace />} />
        <Route path="/jobs/manage"     element={<PL><JobsManage /></PL>} />
        <Route path="/jobs/categories" element={<Navigate to="/jobs/manage" replace />} />
        <Route path="/jobs/locations"  element={<Navigate to="/jobs/manage" replace />} />

        {/* Results */}
        <Route path="/results/list"       element={<PL><ResultsList /></PL>} />
        <Route path="/results/create"     element={<Navigate to="/results/list" replace />} />
        <Route path="/results/update/:id" element={<Navigate to="/results/list" replace />} />
        <Route path="/results/manage"     element={<PL><ResultsManage /></PL>} />
        <Route path="/results/categories" element={<Navigate to="/results/manage" replace />} />

        {/* Sports */}
        <Route path="/sports/list"       element={<PL><SportsList /></PL>} />
        <Route path="/sports/create"     element={<Navigate to="/sports/list" replace />} />
        <Route path="/sports/update/:id" element={<Navigate to="/sports/list" replace />} />
        <Route path="/sports/manage"     element={<PL><SportsManage /></PL>} />
        <Route path="/sports/categories" element={<Navigate to="/sports/manage" replace />} />

        {/* Foods */}
        <Route path="/foods" element={<PL><FoodsList /></PL>} />

        {/* History */}
        <Route path="/history" element={<PL><HistoryList /></PL>} />

        {/* Stays */}
        <Route path="/stays/list"       element={<PL><StaysList /></PL>} />
        <Route path="/stays/create"     element={<Navigate to="/stays/list" replace />} />
        <Route path="/stays/update/:id" element={<Navigate to="/stays/list" replace />} />
        <Route path="/stays/manage"     element={<PL><StaysManage /></PL>} />

        {/* Events */}
        <Route path="/events/list"       element={<PL><EventsList /></PL>} />
        <Route path="/events/create"     element={<Navigate to="/events/list" replace />} />
        <Route path="/events/update/:id" element={<Navigate to="/events/list" replace />} />
        <Route path="/events/manage"     element={<PL><EventsManage /></PL>} />
        <Route path="/events/categories" element={<Navigate to="/events/manage" replace />} />

        {/* Movies */}
        <Route path="/movies/list"     element={<PL><MoviesList /></PL>} />
        <Route path="/movies/manage"   element={<PL><MoviesManage /></PL>} />
        <Route path="/movies/theatres" element={<Navigate to="/movies/manage" replace />} />

        {/* Transport */}
        <Route path="/transport/list"       element={<PL><TransportList /></PL>} />
        <Route path="/transport/create"     element={<Navigate to="/transport/list" replace />} />
        <Route path="/transport/update/:id" element={<Navigate to="/transport/list" replace />} />

        {/* Offers */}
        <Route path="/offers/list"       element={<PL><OffersList /></PL>} />
        <Route path="/offers/create"     element={<Navigate to="/offers/list" replace />} />
        <Route path="/offers/update/:id" element={<Navigate to="/offers/list" replace />} />
        <Route path="/offers/manage"     element={<PL><OffersManage /></PL>} />

        {/* Tourism */}
        <Route path="/tourism/list"       element={<PL><TourismList /></PL>} />
        <Route path="/tourism/create"     element={<Navigate to="/tourism/list" replace />} />
        <Route path="/tourism/update/:id" element={<Navigate to="/tourism/list" replace />} />
        <Route path="/tourism/manage"     element={<PL><TourismManage /></PL>} />
        <Route path="/tourism/categories" element={<Navigate to="/tourism/manage" replace />} />
        <Route path="/tourism/locations"  element={<Navigate to="/tourism/manage" replace />} />

        {/* Real Estate */}
        <Route path="/realestate/list"           element={<PL><RealEstateList /></PL>} />
        <Route path="/realestate/create"         element={<Navigate to="/realestate/list" replace />} />
        <Route path="/realestate/update/:id"     element={<Navigate to="/realestate/list" replace />} />
        <Route path="/realestate/manage"         element={<PL><RealEstateManage /></PL>} />
        <Route path="/realestate/locations"      element={<Navigate to="/realestate/manage" replace />} />
        <Route path="/realestate/property-types" element={<Navigate to="/realestate/manage" replace />} />

        {/* Updates */}
        <Route path="/updates/list"       element={<PL><UpdatesList /></PL>} />
        <Route path="/updates/create"     element={<Navigate to="/updates/list" replace />} />
        <Route path="/updates/update/:id" element={<Navigate to="/updates/list" replace />} />
        <Route path="/updates/manage"     element={<PL><UpdatesManage /></PL>} />
        <Route path="/updates/categories" element={<Navigate to="/updates/manage" replace />} />

        {/* Ads */}
        <Route path="/ads/list"       element={<PL><AdsList /></PL>} />
        <Route path="/ads/create"     element={<Navigate to="/ads/list" replace />} />
        <Route path="/ads/update/:id" element={<Navigate to="/ads/list" replace />} />

        {/* Sponsorships */}
        <Route path="/sponsorships/list"       element={<PL><SponsorshipsList /></PL>} />
        <Route path="/sponsorships/create"     element={<Navigate to="/sponsorships/list" replace />} />
        <Route path="/sponsorships/update/:id" element={<Navigate to="/sponsorships/list" replace />} />

        {/* Instagram */}
        <Route path="/instagram" element={<PL><InstagramManager /></PL>} />

        {/* Leads */}
        <Route path="/leads"        element={<PL><LeadsList /></PL>} />
        <Route path="/leads/manage" element={<PL><LeadsManage /></PL>} />

        {/* Company */}
        <Route path="/company" element={<PL><CompanySettings /></PL>} />

        {/* Users — Superadmin only */}
        <Route path="/users/list"       element={<PLAdmin><UsersList /></PLAdmin>} />
        <Route path="/users/create"     element={<Navigate to="/users/list" replace />} />
        <Route path="/users/update/:id" element={<Navigate to="/users/list" replace />} />

        {/* Roles — Superadmin only */}
        <Route path="/roles/list"       element={<PLAdmin><RolesList /></PLAdmin>} />
        <Route path="/roles/create"     element={<Navigate to="/roles/list" replace />} />
        <Route path="/roles/update/:id" element={<Navigate to="/roles/list" replace />} />

        {/* Settings — Superadmin only */}
        <Route path="/settings"            element={<PLAdmin><SettingsPage /></PLAdmin>} />
        <Route path="/settings/audit-logs" element={<Navigate to="/activity" replace />} />

        {/* Activity — Superadmin only */}
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
    </Suspense>
  )
}
