import { useCallback } from "react";
import apiClient from "../services/apiClient";

/**
 * Global Analytics Hook (§13)
 * Implements fire-and-forget view tracking for cards and pages.
 */
const useAnalytics = () => {
  /**
   * Track specific card interaction/view
   */
  const trackCardView = useCallback((module, id) => {
    if (!module || !id) return;
    
    // Using module-specific card-views endpoint §4/§13
    apiClient.post(`/${module}/${id}/card-views`)
      .catch(err => console.warn(`[Analytics] Card track failed for ${module}:${id}`, err));
  }, []);

  /**
   * Track module page entry
   */
  const trackPageView = useCallback((module, id) => {
    if (!module || !id) return;

    // Using module-specific views endpoint §4/§13
    apiClient.post(`/${module}/${id}/views`)
      .catch(err => console.warn(`[Analytics] Page track failed for ${module}:${id}`, err));
  }, []);

  return { trackCardView, trackPageView };
};

export default useAnalytics;
