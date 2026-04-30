import { useCallback } from "react";
import apiClient from "../services/apiClient";

const useAnalytics = () => {
  // Fires when a specific card's detail modal is opened — per-item counter
  const trackCardView = useCallback((module, id) => {
    if (!module || !id) return;
    apiClient.post(`/${module}/${id}/card-views`)
      .catch(err => console.warn(`[Analytics] Card view failed for ${module}:${id}`, err));
  }, []);

  // Fires on page mount — module-level page visit counter, no item ID
  const trackPageVisit = useCallback((module) => {
    if (!module) return;
    apiClient.post('/analytics/page-visit', { module })
      .catch(err => console.warn(`[Analytics] Page visit failed for ${module}`, err));
  }, []);

  return { trackCardView, trackPageVisit };
};

export default useAnalytics;
