import { useCallback } from "react";
import apiClient from "../services/apiClient";

const useAnalytics = () => {
  const trackCardView = useCallback((module, id) => {
    if (!module || !id) return;
    apiClient.post(`/${module}/${id}/card-views`).catch(() => {});
  }, []);

  const trackPageVisit = useCallback((module) => {
    if (!module) return;
    apiClient.post('/analytics/page-visit', { module }).catch(() => {});
  }, []);

  return { trackCardView, trackPageVisit };
};

export default useAnalytics;
