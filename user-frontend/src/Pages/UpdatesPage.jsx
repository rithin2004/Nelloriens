import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Clock, ChevronRight } from "lucide-react";
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Pagination from "../components/Pagination";
import DetailModal from "../components/DetailModal";
import { fetchUpdates, fetchUpdateCategories, setUpdateParams } from "../state/slices/notificationSlice";
import useAnalytics from "../hooks/useAnalytics";

// ── IST date helpers ───────────────────────────────────────────────────────
const getISTMidnight = (offsetDays = 0) => {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  now.setHours(0, 0, 0, 0);
  if (offsetDays) now.setDate(now.getDate() + offsetDays);
  return now;
};


const classifyUpdate = (item) => {
  const todayStart    = getISTMidnight();
  const tomorrowStart = getISTMidnight(1);
  // Prefer targetDate (scheduled date) over publishedAt
  const raw  = item.targetDate || item.publishedAt || item.timestamp;
  const date = new Date(raw);
  if (date >= tomorrowStart) return "week";    // upcoming (any future date)
  if (date >= todayStart)    return "today";   // today
  return "earlier";                             // past
};

// ── Helpers ────────────────────────────────────────────────────────────────
const timeLabel = (dateStr) => {
  if (!dateStr) return "";
  const diff  = new Date(dateStr).getTime() - Date.now();
  const adiff = Math.abs(diff);
  const days  = Math.floor(adiff / 86400000);
  const hours = Math.floor(adiff / 3600000);
  const mins  = Math.floor(adiff / 60000);
  if (diff >= 0) {
    // future
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  }
  // past
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return "Just now";
};

// ── Shared components ──────────────────────────────────────────────────────
const EmptyState = ({ message }) => (
  <div className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}>
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const CAT_COLORS = {
  food:      { bg: "#FFF7ED", color: "#EA580C" },
  event:     { bg: "#EFF6FF", color: "#2563EB" },
  alert:     { bg: "#FEF3C7", color: "#D97706" },
  news:      { bg: "#F0FDF4", color: "#16A34A" },
  health:    { bg: "#FDF4FF", color: "#9333EA" },
  education: { bg: "#F0F9FF", color: "#0284C7" },
};

const catStyle = (label = "") =>
  CAT_COLORS[label.toLowerCase()] || { bg: "#F1F5F9", color: "#475569" };

const CategoryBadge = ({ label }) => {
  if (!label) return null;
  const s = catStyle(label);
  return (
    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0"
      style={{ background: s.bg, color: s.color }}>
      {label}
    </span>
  );
};

const CategoryIcon = ({ label }) => {
  const s = catStyle(label || "");
  return (
    <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-sm font-black"
      style={{ background: s.bg, color: s.color }}>
      {(label || "U")[0].toUpperCase()}
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────
const SkeletonUpdateCard = () => (
  <div className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse flex gap-3">
    <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-3/5" />
      <div className="h-3 bg-slate-200 rounded w-2/5" />
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-4/5" />
    </div>
  </div>
);

// ── Update card ────────────────────────────────────────────────────────────
const UpdateCard = ({ item, onClick }) => {
  const cat  = item.categoryName || item.category || "";
  const time = item.targetDate || item.publishedAt || item.timestamp;
  return (
    <div
      className="bg-white rounded-xl border border-slate-100 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex gap-3"
      onClick={onClick}
    >
      <CategoryIcon label={cat} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-[0.92rem] font-bold text-slate-900 m-0 leading-snug">{item.title}</h3>
          <CategoryBadge label={cat} />
          {time && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto shrink-0">
              <Clock className="w-3 h-3" /> {timeLabel(time)}
            </span>
          )}
        </div>
        {(item.description || item.message) && (
          <p className="text-[0.8rem] text-slate-500 m-0 line-clamp-2 leading-relaxed">
            {item.description || item.message}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Constants ──────────────────────────────────────────────────────────────
const SECTION_META = {
  today:   { label: "Today",          empty: "No updates scheduled for today."      },
  week:    { label: "Upcoming",        empty: "No upcoming updates."                  },
  earlier: { label: "Earlier",         empty: "No earlier updates."                   },
};
const PER_PAGE = 20;

// ── Main page ──────────────────────────────────────────────────────────────
const UpdatesPage = () => {
  const dispatch = useDispatch();
  const { trackCardView } = useAnalytics();

  const {
    notificationsList = [],
    storedParams      = {},
    status            = "idle",
  } = useSelector((state) => state.notifications || {});

  const isLoading = status === "loading";

  const [view,          setView]          = useState("grouped"); // "grouped" | "section"
  const [activeSection, setActiveSection] = useState(null);
  const [search,        setSearch]        = useState("");
  const [searchQuery,   setSearchQuery]   = useState(""); // committed search term
  const [scope,         setScope]         = useState("nellore");
  const [sectionPage,   setSectionPage]   = useState(1);
  const [modal,         setModal]         = useState(null);

  useEffect(() => {
    dispatch(fetchUpdateCategories());
    dispatch(fetchUpdates({ ...storedParams, scope, limit: 100, page: 1 }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (s) => {
    setScope(s);
    setSearchQuery("");
    setSearch("");
    setView("grouped");
    setActiveSection(null);
    dispatch(fetchUpdates({ ...storedParams, scope: s, limit: 100, page: 1 }));
  };

  const openUpdate = (item) => {
    const id = item.id || item._id;
    if (id) trackCardView("updates", id);
    setModal({ item, actionButtons: [] });
  };

  const goToSection = (section) => {
    setActiveSection(section);
    setView("section");
    setSearch("");
    setSearchQuery("");
    setSectionPage(1);
  };

  const backToGrouped = () => {
    setView("grouped");
    setActiveSection(null);
    setSearch("");
    setSearchQuery("");
    setSectionPage(1);
  };

  // Search submits → always show flat search results (no section grouping)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchQuery(search.trim());
      setView("search");
      setActiveSection(null);
      setSectionPage(1);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setSearchQuery("");
    setView("grouped");
    setActiveSection(null);
    setSectionPage(1);
  };

  // ── Classify all fetched updates by IST date ──────────────────────────
  const classified = useMemo(() => {
    const today = [], week = [], earlier = [];
    for (const item of notificationsList) {
      const c = classifyUpdate(item);
      if (c === "today")   today.push(item);
      else if (c === "week") week.push(item);
      else                   earlier.push(item);
    }
    return { today, week, earlier };
  }, [notificationsList]);

  // ── Flat search across all updates ───────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return notificationsList.filter(
      (i) =>
        i.title?.toLowerCase().includes(q) ||
        (i.description || i.message)?.toLowerCase().includes(q) ||
        (i.categoryName || i.category)?.toLowerCase().includes(q)
    );
  }, [notificationsList, searchQuery]);

  // ── Section view: filter + paginate client-side ───────────────────────
  const sectionFiltered = useMemo(() => {
    if (!activeSection) return [];
    let items = classified[activeSection] || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          (i.description || i.message)?.toLowerCase().includes(q) ||
          (i.categoryName || i.category)?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [classified, activeSection, searchQuery]);

  const totalSectionPages = Math.max(1, Math.ceil(sectionFiltered.length / PER_PAGE));
  const sectionPageItems  = sectionFiltered.slice(
    (sectionPage - 1) * PER_PAGE,
    sectionPage * PER_PAGE
  );

  const sections = ["today", "week", "earlier"];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      <TopHeader />
      <MainHeader />
      <Navbar />

      <main className="flex-1 overflow-x-hidden pt-8 pb-16">
        <div className="px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">

              {/* Heading + scope */}
              <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-1">
                    What's New in{" "}
                    <span className="text-blue-600">
                      {scope === "nellore" ? "Nellore" : "Worldwide"}
                    </span>
                  </h1>
                  <p className="text-sm text-slate-500 m-0">
                    Real-time updates from{" "}
                    {scope === "nellore" ? "across the city" : "around the world"}.
                  </p>
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-full p-0.5 self-start mt-1">
                  {["nellore", "worldwide"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleScopeChange(s)}
                      className="px-3 py-1 rounded-full text-xs font-bold capitalize transition-all"
                      style={scope === s
                        ? { background: "#2563EB", color: "#fff" }
                        : { color: "#64748B" }
                      }
                    >
                      {s === "nellore" ? "Nellore" : "Worldwide"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search — always visible */}
              <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2" role="search">
                <div className="relative flex-1">
                  <label htmlFor="updates-search" className="sr-only">Search updates</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="updates-search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search updates..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </form>

              {/* Back link (section view) */}
              {(view === "section" || view === "search") && (
                <button onClick={backToGrouped}
                  className="mb-5 text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                  ← All Updates
                </button>
              )}

              {/* ── SEARCH RESULTS VIEW ──────────────────────────── */}
              {view === "search" && (
                <>
                  <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900 m-0">
                      Results for &ldquo;{searchQuery}&rdquo;
                    </h2>
                    <button onClick={clearSearch}
                      className="text-xs font-bold text-blue-600 hover:underline">
                      ✕ Clear search
                    </button>
                  </div>
                  {isLoading ? (
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3].map((i) => <SkeletonUpdateCard key={i} />)}
                    </div>
                  ) : searchResults.length === 0 ? (
                    <EmptyState message={`No updates matching "${searchQuery}".`} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {searchResults.map((item) => (
                        <UpdateCard key={item.id || item._id} item={item} onClick={() => openUpdate(item)} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── SECTION VIEW ─────────────────────────────────── */}
              {view === "section" && (
                <>
                  <div className="mb-5 flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-900 m-0">
                      {SECTION_META[activeSection]?.label}
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md"
                      style={{ background: "#EFF6FF", color: "#2563EB" }}>
                      {sectionFiltered.length} updates
                    </span>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3].map((i) => <SkeletonUpdateCard key={i} />)}
                    </div>
                  ) : sectionPageItems.length === 0 ? (
                    <EmptyState message={
                      searchQuery
                        ? `No updates matching "${searchQuery}".`
                        : SECTION_META[activeSection]?.empty
                    } />
                  ) : (
                    <>
                      <div className="flex flex-col gap-3">
                        {sectionPageItems.map((item) => (
                          <UpdateCard
                            key={item.id || item._id}
                            item={item}
                            onClick={() => openUpdate(item)}
                          />
                        ))}
                      </div>
                      {totalSectionPages > 1 && (
                        <div className="mt-8 flex justify-center">
                          <Pagination
                            currentPage={sectionPage}
                            totalPages={totalSectionPages}
                            onPageChange={(p) => {
                              setSectionPage(p);
                              window.scrollTo({ top: 200, behavior: "smooth" });
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* ── GROUPED VIEW ─────────────────────────────────── */}
              {view === "grouped" && (
                isLoading ? (
                  <div className="flex flex-col gap-10">
                    {[1, 2, 3].map((s) => (
                      <div key={s}>
                        <div className="h-3 bg-slate-200 rounded w-16 mb-4 animate-pulse" />
                        <div className="flex flex-col gap-3">
                          {[1, 2, 3].map((i) => <SkeletonUpdateCard key={i} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-10">
                    {sections.map((key) => {
                      const items = classified[key] || [];
                      const meta  = SECTION_META[key];
                      return (
                        <section key={key}>
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 m-0">
                              {meta.label}
                            </h2>
                            {items.length > 0 && (
                              <button
                                onClick={() => goToSection(key)}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                              >
                                See All {items.length}
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {items.length === 0 ? (
                            <EmptyState message={meta.empty} />
                          ) : (
                            <div className="flex flex-col gap-3">
                              {items.slice(0, 3).map((item) => (
                                <UpdateCard
                                  key={item.id || item._id}
                                  item={item}
                                  onClick={() => openUpdate(item)}
                                />
                              ))}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                )
              )}

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

export default UpdatesPage;
