import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Trophy } from "lucide-react";
import sportsHero from "../assets/images/sports-hero.jpg";
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Pagination from "../components/Pagination";
import DetailModal from "../components/DetailModal";
import {
  fetchSportLiveScores,
  fetchUpcomingEvents,
  fetchSportsArticles,
  fetchSportCategories,
  setSportParams,
} from "../state/slices/sportsSlice";
import useAnalytics from "../hooks/useAnalytics";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins  = Math.floor(diff / 60000);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return "Today";
};

const EmptyState = ({ message }) => (
  <div
    className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}
  >
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const SectionHeading = ({ title }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-1 h-4 bg-red-500 rounded-sm shrink-0" />
    <h2 className="text-lg font-black text-slate-900 m-0">{title}</h2>
  </div>
);

const SkeletonLiveCard = () => (
  <div className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" />
      <div className="h-4 bg-slate-200 rounded w-32" />
    </div>
    <div className="h-3 bg-slate-200 rounded w-10" />
  </div>
);

const SkeletonEventCard = () => (
  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="w-full h-40 bg-slate-200" />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  </div>
);

const SkeletonArticleCard = () => (
  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="w-full h-40 bg-slate-200" />
    <div className="p-5 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  </div>
);

const SportsPage = () => {
  const dispatch = useDispatch();
  const { trackCardView } = useAnalytics();

  const {
    liveScores     = [],
    upcomingEvents = [],
    sportsArticles = [],
    categories     = [],
    storedParams   = {},
    status         = "idle",
    sportsPage     = {},
  } = useSelector((state) => state.sports || {});

  const isLoading = status === "loading";

  const [search, setSearch] = useState(storedParams.search || "");
  const [scope, setScope]   = useState("nellore");
  const [modal, setModal]   = useState(null);

  useEffect(() => {
    dispatch(fetchSportCategories());
    dispatch(fetchSportLiveScores({ scope: "nellore" }));
    dispatch(fetchUpcomingEvents({ scope: "nellore" }));
    dispatch(fetchSportsArticles({ ...storedParams, scope: "nellore" }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    dispatch(fetchSportLiveScores({ scope: newScope }));
    dispatch(fetchUpcomingEvents({ scope: newScope }));
    const newParams = { page: 1 };
    dispatch(setSportParams(newParams));
    dispatch(fetchSportsArticles({ ...storedParams, ...newParams, scope: newScope }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { search, page: 1 };
    dispatch(setSportParams(newParams));
    dispatch(fetchSportsArticles({ ...storedParams, ...newParams, scope }));
  };

  const handleCategoryChange = (categoryId) => {
    const newParams = { category: categoryId, page: 1 };
    dispatch(setSportParams(newParams));
    dispatch(fetchSportsArticles({ ...storedParams, ...newParams, scope }));
  };

  const handlePageChange = (page) => {
    const newParams = { page };
    dispatch(setSportParams(newParams));
    dispatch(fetchSportsArticles({ ...storedParams, ...newParams, scope }));
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const openModal = (item, actionButtons) => {
    const id = item.id || item._id;
    if (id) trackCardView("sports", id);
    setModal({ item, actionButtons: actionButtons || [] });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      <TopHeader />
      <MainHeader />
      <Navbar />

      <main className="flex-1 overflow-x-hidden pt-8 pb-16">
        <div className="px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Main column ──────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Heading + scope */}
              <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-1">Sports</h1>
                  <p className="text-sm text-slate-500 m-0">
                    Sports updates in{" "}
                    <span className="font-semibold text-blue-600">
                      {scope === "nellore" ? "Nellore" : "Worldwide"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-full p-0.5 self-start mt-1">
                  {["nellore", "worldwide"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleScopeChange(s)}
                      className="px-3 py-1 rounded-full text-xs font-bold capitalize transition-all"
                      style={
                        scope === s
                          ? { background: "#2563EB", color: "#fff" }
                          : { color: "#64748B" }
                      }
                    >
                      {s === "nellore" ? "Nellore" : "Worldwide"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Banner */}
              <div
                className="mb-10 rounded-2xl sm:rounded-3xl overflow-hidden relative h-50 sm:h-70 lg:h-100"
                style={{
                  backgroundImage: `url(${sportsHero})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center 20%",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "#0f172a",
                }}
              >
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)" }}>
                  <div className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-2 sm:mb-3 w-fit"
                    style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}>
                    <Trophy size={13} />
                    Sports Hub
                  </div>
                  <h2 className="text-base sm:text-[1.4rem] font-black text-white mb-1 leading-tight">
                    Scores, Fixtures, and Local Sports Updates
                  </h2>
                  <p className="text-white/75 text-xs sm:text-sm m-0 hidden sm:block">
                    Cricket, Volleyball, Kabaddi, Athletics and more across Nellore &amp; beyond.
                  </p>
                </div>
              </div>

              {/* Section 1 — Live Scores */}
              <section className="mb-10">
                <SectionHeading title="Live Scores" />
                {isLoading && liveScores.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => <SkeletonLiveCard key={i} />)}
                  </div>
                ) : liveScores.length === 0 ? (
                  <EmptyState message="No live scores available right now." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {liveScores.map((score) => (
                      <div
                        key={score.id || score._id}
                        className="bg-white rounded-xl border border-slate-100 p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex items-center justify-between gap-4"
                        onClick={() =>
                          openModal(
                            score,
                            score.liveUrl ? [{ label: "View Live Score", url: score.liveUrl }] : []
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                          <span className="font-bold text-slate-800 text-sm">
                            {score.sportName || score.title}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Live</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section 2 — Upcoming Sports */}
              <section className="mb-10">
                <SectionHeading title="Upcoming Sports" />
                {isLoading && upcomingEvents.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map((i) => <SkeletonEventCard key={i} />)}
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <EmptyState message="No upcoming sports events at the moment." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id || event._id}
                        className="bg-white rounded-xl border border-slate-100 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        onClick={() => openModal(event)}
                      >
                        {(event.image || event.thumbnail) && (
                          <img
                            src={event.image || event.thumbnail}
                            alt={event.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-bold text-sm text-slate-900 mb-1 leading-snug">
                            {event.title}
                          </h4>
                          {event.teamA && event.teamB && (
                            <p className="text-xs font-bold text-blue-600 mb-2">
                              {event.teamA} vs {event.teamB}
                            </p>
                          )}
                          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                            {event.venue && <span>{event.venue}</span>}
                            {(event.validUpto || event.date) && (
                              <span>
                                {new Date(event.validUpto || event.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {event.category && (
                            <span className="inline-block mt-2 text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              {event.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section 3 — Sports News & Articles */}
              <section>
                <SectionHeading title="Sports News & Articles" />

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-5 flex gap-2" role="search">
                  <div className="relative flex-1">
                    <label htmlFor="sports-search" className="sr-only">Search sports news</label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="sports-search"
                      name="search"
                      type="search"
                      autoComplete="off"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search sports news..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </form>

                {/* Category filters */}
                {(isLoading || categories.length > 0) && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-5">
                    {[{ id: "All", label: "All Sports" }, ...categories].map((cat) => {
                      const id = cat.id || cat._id;
                      const isActive = (storedParams.category || "All") === id;
                      return (
                        <button
                          key={id}
                          onClick={() => handleCategoryChange(id)}
                          className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border"
                          style={
                            isActive
                              ? { background: "#2563EB", color: "#fff", borderColor: "#2563EB" }
                              : { background: "#fff", color: "#475569", borderColor: "#e2e8f0" }
                          }
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Articles grid */}
                {isLoading && sportsArticles.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => <SkeletonArticleCard key={i} />)}
                  </div>
                ) : sportsArticles.length === 0 ? (
                  <EmptyState message="No sports articles found." />
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sportsArticles.map((article) => (
                        <div
                          key={article.id || article._id}
                          className="bg-white rounded-xl border border-slate-100 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                          onClick={() => openModal(article)}
                        >
                          {(article.image || article.thumbnail) && (
                            <img
                              src={article.image || article.thumbnail}
                              alt={article.title}
                              className="w-full h-40 object-cover"
                            />
                          )}
                          <div className="p-5">
                            <h4 className="font-bold text-[0.95rem] text-slate-900 mb-2 leading-snug">
                              {article.title}
                            </h4>
                            {article.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                                {article.description}
                              </p>
                            )}
                            <div className="flex justify-between items-center text-[11px] text-slate-400">
                              {(article.postedAt || article.publishedAt) && (
                                <span>{timeAgo(article.postedAt || article.publishedAt)}</span>
                              )}
                              {article.category && (
                                <span className="font-bold text-blue-600 uppercase">
                                  {article.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {sportsPage.totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination
                          currentPage={sportsPage.currentPage}
                          totalPages={sportsPage.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </section>

            </div>

            <SidebarContent includeAds={true} />
          </div>
        </div>
      </main>

      <Footer />

      {modal && (
        <DetailModal
          item={modal.item}
          onClose={() => setModal(null)}
          actionButtons={modal.actionButtons}
        />
      )}
    </div>
  );
};

export default SportsPage;
