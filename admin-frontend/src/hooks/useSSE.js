/**
 * useSSE — RULE 7
 *
 * Initialises the SSE connection on app load (called once in Layout).
 * Maps incoming { module } events to the correct Zustand store's fetch().
 * Each store re-fetches from the backend REST API using its last-used params,
 * so the user stays on their current page / filters automatically.
 *
 * On reconnect after a dropped connection → re-fetches ALL stores immediately
 * (RULE 7 — SSE Resilience: does not wait for next SSE event).
 */
import { useEffect } from 'react'
import { connect, disconnect } from '../services/sse'

// Zustand stores — one per module
import useNewsStore         from '../store/newsStore'
import useEventsStore       from '../store/eventsStore'
import useJobsStore         from '../store/jobsStore'
import useResultsStore      from '../store/resultsStore'
import useSportsStore       from '../store/sportsStore'
import useFoodsStore        from '../store/foodsStore'
import useHistoryStore      from '../store/historyStore'
import useStaysStore        from '../store/staysStore'
import useMoviesStore       from '../store/moviesStore'
import useTransportStore    from '../store/transportStore'
import useOffersStore       from '../store/offersStore'
import useTourismStore      from '../store/tourismStore'
import useUpdatesStore      from '../store/updatesStore'
import useAdsStore          from '../store/adsStore'
import useSponsorshipsStore from '../store/sponsorshipsStore'
import useLeadsStore        from '../store/leadsStore'
import useUsersStore        from '../store/usersStore'
import useRolesStore        from '../store/rolesStore'
import useRecycleBinStore   from '../store/recycleBinStore'
import useRealEstateStore   from '../store/realEstateStore'

/** Re-fetches every Zustand store — called on SSE reconnect (RULE 7) */
function refetchAllStores() {
  useNewsStore.getState().fetch()
  useEventsStore.getState().fetch()
  useJobsStore.getState().fetch()
  useResultsStore.getState().fetch()
  useSportsStore.getState().fetch()
  useFoodsStore.getState().fetch()
  useHistoryStore.getState().fetch()
  useStaysStore.getState().fetch()
  useMoviesStore.getState().fetch()
  useTransportStore.getState().fetch()
  useOffersStore.getState().fetch()
  useTourismStore.getState().fetch()
  useUpdatesStore.getState().fetch()
  useAdsStore.getState().fetch()
  useSponsorshipsStore.getState().fetch()
  useLeadsStore.getState().fetch()
  useUsersStore.getState().fetch()
  useRolesStore.getState().fetch()
  useRecycleBinStore.getState().fetch()
  useRecycleBinStore.getState().fetchStats()
  useRealEstateStore.getState().fetch()
}

export function useSSE() {
  useEffect(() => {
    connect(
      ({ module }) => {
        switch (module) {
          case 'news':              useNewsStore.getState().fetch();         break
          case 'events':            useEventsStore.getState().fetch();       break
          case 'influencer_events': useEventsStore.getState().fetch();       break  // influencer events shown on events page
          case 'breaking_points':   useNewsStore.getState().fetch();         break  // breaking news shown on news page
          case 'jobs':              useJobsStore.getState().fetch();         break
          case 'results':           useResultsStore.getState().fetch();      break
          case 'sports':            useSportsStore.getState().fetch();       break
          case 'sport_live_scores': useSportsStore.getState().fetch();       break
          case 'foods':             useFoodsStore.getState().fetch();        break
          case 'history':           useHistoryStore.getState().fetch();      break
          case 'stays':             useStaysStore.getState().fetch();        break
          case 'movies':            useMoviesStore.getState().fetch();       break
          case 'theatres':          useMoviesStore.getState().fetch();       break  // theatres update triggers movie list refresh
          case 'transport':         useTransportStore.getState().fetch();    break
          case 'offers':            useOffersStore.getState().fetch();       break
          case 'tourism':               useTourismStore.getState().fetch();  break
          case 'tourism_display_photos': useTourismStore.getState().fetch(); break  // display photos update triggers tourism page refresh
          case 'updates':           useUpdatesStore.getState().fetch();      break
          case 'ads':               useAdsStore.getState().fetch();          break
          case 'sponsorships':      useSponsorshipsStore.getState().fetch(); break
          case 'leads':             useLeadsStore.getState().fetch();        break
          case 'users':             useUsersStore.getState().fetch();        break
          case 'roles':             useRolesStore.getState().fetch();        break
          case 'recyclebin':        {
            useRecycleBinStore.getState().fetch()
            useRecycleBinStore.getState().fetchStats()
            break
          }
          case 'realestate':        useRealEstateStore.getState().fetch();   break
          default: break
        }
      },
      refetchAllStores  // RULE 7 — re-fetch all on reconnect
    )

    return () => disconnect()
  }, [])
}
