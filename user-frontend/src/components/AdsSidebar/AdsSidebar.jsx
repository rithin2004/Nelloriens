import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAds, fetchSponsorships, fetchInstagramFeed } from "../../state/slices/commonAdsSlice";
import RecommendedSection from "./RecommendedSection";
import SponsoredSection from "./SponsoredSection";
import SocialFeed from "./SocialFeed";
import MobileAdsHero from "./MobileAdsHero";
import WeatherCard from "../WeatherCard/WeatherCard";

const AdsSidebar = ({ isInline = false, maxAds = 10, isSticky = true, showWeather = false, mobileSlot = null }) => {
  const dispatch = useDispatch();
  const [hasEntered, setHasEntered] = useState(false);

  const { sponsorships, ads, instagramFeed, adsLoading, sponsorshipsLoading, instagramLoading } =
    useSelector((state) => state.commonAds);

  useEffect(() => {
    dispatch(fetchAds());
    dispatch(fetchSponsorships());
    dispatch(fetchInstagramFeed());
    const timer = setTimeout(() => setHasEntered(true), 100);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const isLoading = adsLoading || sponsorshipsLoading || instagramLoading;

  // Correct mapping: ads → Recommended, sponsorships → Sponsored
  const recommendedData = ads?.slice(0, maxAds) || [];
  const sponsoredData   = sponsorships?.slice(0, maxAds) || [];
  const communityData   = instagramFeed?.slice(0, 6) || [];
  const hasAnyData = recommendedData.length > 0 || sponsoredData.length > 0 || communityData.length > 0;

  // ── Mobile slot rendering ────────────────────────────────────
  // mobileSlot="top"    → hero carousel (ads)
  // mobileSlot="middle" → sponsorships strip
  // mobileSlot="bottom" → instagram grid
  if (mobileSlot === "top") {
    if (!recommendedData.length) return null;
    return <MobileAdsHero ads={recommendedData} />;
  }
  if (mobileSlot === "middle") {
    if (!sponsoredData.length) return null;
    return (
      <div className="w-full my-6 lg:hidden">
        <SponsoredSection sponsorships={sponsoredData} inline />
      </div>
    );
  }
  if (mobileSlot === "bottom") {
    if (!communityData.length) return null;
    return (
      <div className="w-full my-6 lg:hidden">
        <SocialFeed posts={communityData} />
      </div>
    );
  }

  // ── Loading skeleton (desktop/tablet sidebar only) ───────────
  if (isLoading && !hasEntered) {
    if (isInline) return null;
    return (
      <aside className={isSticky ? "sticky top-22.5 z-40 self-start" : ""}>
        <div className="flex flex-col gap-6 w-full p-6 rounded-3xl bg-white/35 backdrop-blur-lg border border-white/40 shadow-[0_12px_40px_0_rgba(31,38,135,0.05)]">
          <div className="skeleton-spotlight" />
        </div>
      </aside>
    );
  }

  if (!hasAnyData) return null;

  // ── Desktop / tablet sidebar ─────────────────────────────────
  return (
    <aside className={isSticky ? "sticky top-22.5 z-40 self-start max-h-[calc(100vh-6rem)] overflow-y-auto" : ""}>
      {showWeather && <div className="mb-6"><WeatherCard /></div>}

      <div
        className="flex flex-col gap-6 w-full p-6 rounded-3xl border border-white/40 shadow-[0_12px_40px_0_rgba(31,38,135,0.05)] overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)' }}
      >
        {/* Recommended — ads, bottom-to-top */}
        {recommendedData.length > 0 && (
          <div className="max-h-96 overflow-hidden relative">
            <div
              className={recommendedData.length > 1 ? "ticker-hover-pause flex flex-col gap-4" : "flex flex-col gap-4"}
              style={recommendedData.length > 1 ? { animation: 'sidebarScrollUp 30s linear infinite' } : undefined}
            >
              <RecommendedSection ads={recommendedData} />
              {recommendedData.length > 1 && <RecommendedSection ads={recommendedData} hideTitle />}
            </div>
          </div>
        )}

        {/* Sponsored — sponsorships, right-to-left */}
        {sponsoredData.length > 0 && (
          <SponsoredSection sponsorships={sponsoredData} animate={sponsoredData.length > 1} />
        )}

        {/* Community — instagram hover-play */}
        {communityData.length > 0 && <SocialFeed posts={communityData} />}
      </div>
    </aside>
  );
};

export default AdsSidebar;
