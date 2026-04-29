import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchNews, fetchBreakingPoints } from "../state/slices/newsSlice";
import { fetchJobs } from "../state/slices/jobsSlice";
import { fetchUpdates } from "../state/slices/notificationSlice";
import { fetchEvents } from "../state/slices/eventsSlice";
import { fetchTourism } from "../state/slices/tourismSlice";
import { fetchFamousFoods, fetchSweets } from "../state/slices/famousFoodsSlice";
import { fetchFamousStays } from "../state/slices/famousStaysSlice";
import { fetchMovies, fetchTheaters } from "../state/slices/moviesSlice";
import { fetchSportsEvents, fetchSportsArticles } from "../state/slices/sportsSlice";
import { fetchResults } from "../state/slices/resultsSlice";
import { fetchHistory } from "../state/slices/historySlice";
import { fetchOffers } from "../state/slices/offersSlice";
import { fetchTransports } from "../state/slices/transportSlice";
import { fetchProperties } from "../state/slices/realEstateSlice";
import { fetchAds, fetchSponsorships, fetchInstagramFeed } from "../state/slices/commonAdsSlice";

const useSSE = () => {
  const dispatch = useDispatch();
  const eventSourceRef = useRef(null);
  const retryRef = useRef(0);
  const retryTimerRef = useRef(null);

  // Store all params in a ref — updated whenever Redux state changes,
  // but does NOT re-run the SSE connection effect.
  const paramsRef = useRef({});

  const newsParams     = useSelector((state) => state.news.storedParams);
  const jobsParams     = useSelector((state) => state.jobs.storedParams);
  const updateParams   = useSelector((state) => state.notifications.storedParams);
  const eventsParams   = useSelector((state) => state.events.storedParams);
  const tourismParams  = useSelector((state) => state.tourism.storedParams);
  const foodsParams    = useSelector((state) => state.famousFoods.storedParams);
  const stayParams     = useSelector((state) => state.famousStays.storedParams);
  const moviesParams   = useSelector((state) => state.movies.storedParams);
  const sportsParams   = useSelector((state) => state.sports.storedParams);
  const resultsParams  = useSelector((state) => state.results.storedParams);
  const historyParams  = useSelector((state) => state.history.storedParams);
  const offersParams   = useSelector((state) => state.offers.storedParams);
  const transportParams= useSelector((state) => state.transport.storedParams);
  const reParams       = useSelector((state) => state.realEstate.storedParams);

  // Keep ref in sync with latest params — no SSE reconnect on filter changes
  useEffect(() => {
    paramsRef.current = {
      news: newsParams, jobs: jobsParams, updates: updateParams,
      events: eventsParams, tourism: tourismParams, foods: foodsParams,
      stays: stayParams, movies: moviesParams, sports: sportsParams,
      results: resultsParams, history: historyParams, offers: offersParams,
      transport: transportParams, realestate: reParams,
    };
  }, [
    newsParams, jobsParams, updateParams, eventsParams, tourismParams,
    foodsParams, stayParams, moviesParams, sportsParams, resultsParams,
    historyParams, offersParams, transportParams, reParams,
  ]);

  const refreshModule = (module) => {
    const p = paramsRef.current;
    switch (module) {
      case "news":           dispatch(fetchNews(p.news));                    break;
      case "jobs":           dispatch(fetchJobs(p.jobs));                    break;
      case "updates":        dispatch(fetchUpdates(p.updates));              break;
      case "events":
      case "influencer_events":
                             dispatch(fetchEvents(p.events));                break;
      case "tourism":
      case "tourism_display_photos":
                             dispatch(fetchTourism(p.tourism));              break;
      case "foods":          dispatch(fetchFamousFoods(p.foods));
                             dispatch(fetchSweets(p.foods));                 break;
      case "stays":
      case "stay":           dispatch(fetchFamousStays(p.stays));            break;
      case "movies":         dispatch(fetchMovies(p.movies));
                             dispatch(fetchTheaters({}));                    break;
      case "theatres":       dispatch(fetchTheaters({}));                    break;
      case "sports":
      case "sport_live_scores":
                             dispatch(fetchSportsEvents(p.sports));
                             dispatch(fetchSportsArticles(p.sports));        break;
      case "results":        dispatch(fetchResults(p.results));              break;
      case "history":        dispatch(fetchHistory(p.history));              break;
      case "offers":         dispatch(fetchOffers(p.offers));                break;
      case "transport":      dispatch(fetchTransports(p.transport));         break;
      case "realestate":
      case "real-estate":    dispatch(fetchProperties(p.realestate));        break;
      case "ads":            dispatch(fetchAds());                           break;
      case "sponsorships":   dispatch(fetchSponsorships());                  break;
      case "instagram":      dispatch(fetchInstagramFeed());                 break;
      case "breaking_news":
      case "breaking_points":dispatch(fetchBreakingPoints());                break;
      default:                                                               break;
    }
  };

  // Connect once — stable, never reconnects on filter changes
  useEffect(() => {
    const sseUrl = `${import.meta.env.VITE_API_BASE_URL}/realtime/sse`;

    const connect = () => {
      if (eventSourceRef.current) eventSourceRef.current.close();

      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.module) refreshModule(data.module);
        } catch {
          // ignore malformed events
        }
      });

      es.onopen = () => {
        if (retryRef.current > 0) {
          const p = paramsRef.current;
          dispatch(fetchNews(p.news));             dispatch(fetchBreakingPoints());
          dispatch(fetchJobs(p.jobs));             dispatch(fetchUpdates(p.updates));
          dispatch(fetchEvents(p.events));         dispatch(fetchTourism(p.tourism));
          dispatch(fetchFamousFoods(p.foods));     dispatch(fetchSweets(p.foods));
          dispatch(fetchFamousStays(p.stays));     dispatch(fetchMovies(p.movies));
          dispatch(fetchTheaters({}));             dispatch(fetchSportsEvents(p.sports));
          dispatch(fetchSportsArticles(p.sports)); dispatch(fetchResults(p.results));
          dispatch(fetchHistory(p.history));       dispatch(fetchOffers(p.offers));
          dispatch(fetchTransports(p.transport));  dispatch(fetchProperties(p.realestate));
          dispatch(fetchAds());                    dispatch(fetchSponsorships());
          dispatch(fetchInstagramFeed());
        }
        retryRef.current = 0;
      };

      es.onerror = () => {
        es.close();
        const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
        retryRef.current += 1;
        retryTimerRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable — never reconnects on param changes

  return null;
};

export default useSSE;
