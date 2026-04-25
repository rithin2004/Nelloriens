import { useSelector } from "react-redux";
import AdsSidebar from "../AdsSidebar/AdsSidebar";

const SidebarContent = ({ includeAds = false, maxAds, showWeather = false, isSticky = true }) => {
  const { ads, sponsorships, instagramFeed, adsLoading, sponsorshipsLoading, instagramLoading } =
    useSelector((state) => state.commonAds);

  if (!includeAds) return null;

  const isLoading = adsLoading || sponsorshipsLoading || instagramLoading;
  const hasData = ads.length > 0 || sponsorships.length > 0 || instagramFeed.length > 0;

  // Collapse the column entirely when loading is done and there's no data
  if (!isLoading && !hasData) return null;

  return (
    <aside className="hidden lg:block lg:w-80 shrink-0">
      <AdsSidebar maxAds={maxAds} isSticky={isSticky} showWeather={showWeather} />
    </aside>
  );
};

export default SidebarContent;
