import { useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';

const ENDPOINTS = {
  google:  { impression: (id) => `/ads/${id}/impressions`,          click: (id) => `/ads/${id}/clicks` },
  partner: { impression: (id) => `/sponsorships/${id}/impressions`, click: (id) => `/sponsorships/${id}/clicks` },
  social:  { impression: (id) => `/instagram/posts/${id}/impressions`, click: (id) => `/instagram/posts/${id}/touches` },
};

const track = (adId, section, type) => {
  const ep = ENDPOINTS[section];
  if (!ep || !adId) return;
  const url = type === 'impression' ? ep.impression(adId) : ep.click(adId);
  apiClient.post(url).catch(() => {});
};

export const useAdTracking = (adId, section) => {
  const elementRef = useRef(null);
  const impressionTracked = useRef(false);

  useEffect(() => {
    if (!adId || !elementRef.current || impressionTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionTracked.current) {
            impressionTracked.current = true;
            track(adId, section, 'impression');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    const el = elementRef.current;
    observer.observe(el);

    return () => {
      observer.unobserve(el);
    };
  }, [adId, section]);

  const handleAdClick = () => {
    track(adId, section, 'click');
  };

  return { elementRef, handleAdClick };
};

export default useAdTracking;
