import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Pagination from "../components/Pagination";
import DetailModal from "../components/DetailModal";
import {
  fetchEvents,
  fetchEventCategories,
  fetchInfluencerEvents,
  setEventParams,
} from "../state/slices/eventsSlice";
import useAnalytics from "../hooks/useAnalytics";

// ── Skeleton ───────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden animate-pulse border border-slate-100 flex flex-col">
    <div className="h-48 bg-slate-200 shrink-0" />
    <div className="p-5 flex flex-col gap-3 flex-1">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
      <div className="mt-auto flex items-center gap-3 pt-2">
        <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          <div className="h-2.5 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonCategoryPill = () => (
  <div className="shrink-0 w-32 h-10 rounded-full bg-slate-200 animate-pulse" />
);

const SkeletonInfluencer = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col items-center gap-3 animate-pulse">
    <div className="w-20 h-20 rounded-full bg-slate-200" />
    <div className="h-3 bg-slate-200 rounded w-1/2" />
    <div className="h-4 bg-slate-200 rounded w-2/3" />
  </div>
);

// ── Shared UI ──────────────────────────────────────────────────────────────

const EmptyState = ({ message }) => (
  <div
    className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}
  >
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>
      {message}
    </p>
  </div>
);

const SectionHeading = ({ title }) => (
  <div className="flex items-center gap-2">
    <div className="w-1 h-4 bg-red-500 rounded-sm shrink-0" />
    <h2 className="text-[1.1rem] font-extrabold text-slate-900 m-0 tracking-tight">{title}</h2>
  </div>
);

// ── Event card (matches PDF design) ───────────────────────────────────────

const EventCard = ({ event, onClick }) => (
  <div
    onClick={() => onClick(event)}
    className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col overflow-hidden h-full"
  >
    <div className="relative h-48 w-full overflow-hidden shrink-0">
      {event.image || event.thumbnail ? (
        <img
          src={event.image || event.thumbnail}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
          <span className="text-4xl text-slate-300">🎪</span>
        </div>
      )}
      {event.isVerified && (
        <span className="absolute top-2.5 right-2.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          ✓ Verified
        </span>
      )}
    </div>
    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-[17px] font-extrabold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
        {event.title}
      </h3>
      {event.description && (
        <p className="text-slate-500 text-[13px] font-medium mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {event.authorImage ? (
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-100">
              <img
                src={event.authorImage}
                alt={event.authorName || ""}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full shrink-0 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">
              {(event.authorName || event.organizer || "E").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-slate-900 leading-none mb-0.5 capitalize truncate">
              {event.authorName || event.organizer || ""}
            </span>
            <span className="text-[11px] text-slate-400">
              {event.date || event.startDate
                ? new Date(event.date || event.startDate).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric",
                  })
                : ""}
              {(event.eventStartTime || event.startTime) && (
                <span className="ml-1">· {event.eventStartTime || event.startTime}{event.eventEndTime || event.endTime ? ` – ${event.eventEndTime || event.endTime}` : ""}</span>
              )}
            </span>
          </div>
        </div>
        <button
          className="text-slate-300 hover:text-slate-600 transition-colors shrink-0 ml-2"
          onClick={(e) => e.stopPropagation()}
          aria-label="Bookmark"
        >
          <Bookmark className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

// ── Influencer person card ─────────────────────────────────────────────────

const InfluencerCard = ({ event, onClick }) => (
  <div
    onClick={() => onClick(event)}
    className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
  >
    {event.image || event.thumbnail ? (
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 mb-3 shrink-0">
        <img
          src={event.image || event.thumbnail}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    ) : (
      <div className="w-20 h-20 rounded-full bg-slate-100 mb-3 shrink-0 flex items-center justify-center text-slate-300 text-2xl">
        👤
      </div>
    )}
    {(event.role || event.category || event.categoryName) && (
      <p className="text-[11px] text-slate-400 m-0 mb-1">
        {event.role || event.category || event.categoryName}
      </p>
    )}
    <h3 className="text-sm font-bold text-slate-900 m-0 leading-snug line-clamp-2">
      {event.title}
    </h3>
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────────

const EventsPage = () => {
  const dispatch = useDispatch();
  const { trackCardView, trackPageView } = useAnalytics();

  const {
    categories = [],
    popularEvents = [],
    latestEvents = [],
    influencerEvents = [],
    storedParams = {},
    status = "idle",
    eventsPage = {},
  } = useSelector((state) => state.events || {});

  const isLoading = status === "loading";

  const [scope, setScope] = useState("nellore");
  const [search, setSearch] = useState(storedParams.search || "");
  const [modal, setModal] = useState(null);
  const popRailRef = useRef(null);

  useEffect(() => {
    dispatch(fetchEventCategories());
    dispatch(fetchInfluencerEvents());
    dispatch(fetchEvents({ ...storedParams, scope, limit: 18 }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    setSearch("");
    const newParams = { page: 1, search: "" };
    dispatch(setEventParams(newParams));
    dispatch(fetchEvents({ ...storedParams, ...newParams, scope: newScope, limit: 18 }));
  };

  const handleCategoryFilter = (categoryId) => {
    const newParams = { category: categoryId, page: 1 };
    dispatch(setEventParams(newParams));
    dispatch(fetchEvents({ ...storedParams, ...newParams, scope, limit: 18 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { search, page: 1 };
    dispatch(setEventParams(newParams));
    dispatch(fetchEvents({ ...storedParams, ...newParams, scope, limit: 18 }));
  };

  const clearSearch = () => {
    setSearch("");
    const newParams = { search: "", page: 1 };
    dispatch(setEventParams(newParams));
    dispatch(fetchEvents({ ...storedParams, ...newParams, scope, limit: 18 }));
  };

  const openEvent = (event) => {
    const id = event.id || event._id;
    if (id) { trackCardView("events", id); trackPageView("events", id); }
    setModal({
      item: event,
      actionButtons: [
        ...(event.bookingUrl ? [{ label: "Book Now", url: event.bookingUrl }] : []),
        ...(event.registrationRequired && event.registrationUrl ? [{ label: "Register Now", url: event.registrationUrl }] : []),
      ],
    });
  };

  const onPageChange = (page) => {
    const newParams = { page };
    dispatch(setEventParams(newParams));
    dispatch(fetchEvents({ ...storedParams, ...newParams, scope, limit: 18 }));
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const scrollPop = (dir) => {
    if (popRailRef.current) {
      popRailRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  const activeCategory = storedParams.category || "All";
  const isSearchActive = !!storedParams.search;

  // Recent: first 6, Latest: non-popular
  const carouselItems = useMemo(() => latestEvents.slice(0, 6), [latestEvents]);
  const latestPosts   = useMemo(() => latestEvents.filter((e) => !e.isPopular), [latestEvents]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      <TopHeader />
      <MainHeader />
      <Navbar />

      <main className="flex-1 overflow-x-hidden pt-8 pb-16">
        <div className="px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Main column ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Heading + scope */}
              <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-1">Events</h1>
                  <p className="text-sm text-slate-500 m-0">
                    Discover what's happening in{" "}
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

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6 flex gap-2" role="search">
                <div className="relative flex-1">
                  <label htmlFor="events-search" className="sr-only">Search events</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="events-search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events..."
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

              {/* Category rail — only shown when at least one category exists */}
              {(isLoading || categories.length > 0) && (
              <div className="mb-8 overflow-x-auto scrollbar-none">
                <div className="flex gap-3 w-max py-1 px-1">
                  {isLoading && categories.length === 0 ? (
                    [1, 2, 3, 4, 5].map((i) => <SkeletonCategoryPill key={i} />)
                  ) : (
                    [
                      { id: "All", name: "All", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&fit=crop" },
                      ...categories,
                    ].map((cat) => {
                      const id = cat.id || cat._id || cat.name;
                      const isActive = activeCategory === id;
                      return (
                        <button
                          key={id}
                          onClick={() => handleCategoryFilter(id)}
                          className="shrink-0 relative w-32 h-10 rounded-full overflow-hidden cursor-pointer transition-all duration-200"
                          style={isActive ? { transform: "scale(1.05)" } : undefined}
                          aria-label={`Filter by ${cat.name}`}
                        >
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/45" />
                          <div className="absolute inset-0 flex items-center justify-center px-2">
                            <span className="text-[11px] font-black uppercase tracking-wider truncate text-white drop-shadow">
                              {cat.name}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              )}

              {/* ── Search results ── */}
              {isSearchActive ? (
                <section className="mb-10">
                  <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
                    <SectionHeading title={`Results for "${storedParams.search}"`} />
                    <button
                      onClick={clearSearch}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      ✕ Clear search
                    </button>
                  </div>
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                    </div>
                  ) : latestEvents.length === 0 ? (
                    <EmptyState message="No events found for this search." />
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {latestEvents.map((event) => (
                          <EventCard key={event.id || event._id} event={event} onClick={openEvent} />
                        ))}
                      </div>
                      {eventsPage.totalPages > 1 && (
                        <div className="mt-8">
                          <Pagination
                            currentPage={eventsPage.currentPage}
                            totalPages={eventsPage.totalPages}
                            onPageChange={onPageChange}
                          />
                        </div>
                      )}
                    </>
                  )}
                </section>
              ) : (
                <>
                  {/* ── Recent Events — no heading, only shown when items exist ── */}
                  {(isLoading || carouselItems.length > 0) && (
                    <section className="mb-10">
                      {isLoading ? (
                        <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none px-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-[80vw] sm:w-72 shrink-0">
                              <SkeletonCard />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none px-1">
                          {carouselItems.map((event) => (
                            <div key={event.id || event._id} className="w-[80vw] sm:w-72 shrink-0">
                              <EventCard event={event} onClick={openEvent} />
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {/* ── Popular Events — always shown ── */}
                  <section className="mb-10">
                    <div className="mb-4 flex items-center justify-between">
                      <SectionHeading title="Popular Events" />
                      {popularEvents.length > 1 && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => scrollPop("left")}
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
                            aria-label="Scroll left"
                          >
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={() => scrollPop("right")}
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
                            aria-label="Scroll right"
                          >
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      )}
                    </div>
                    {isLoading ? (
                      <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none px-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-[80vw] sm:w-72 shrink-0">
                            <SkeletonCard />
                          </div>
                        ))}
                      </div>
                    ) : popularEvents.length === 0 ? (
                      <EmptyState message="No popular events yet." />
                    ) : (
                      <div ref={popRailRef} className="flex gap-5 overflow-x-auto pb-2 scrollbar-none px-1">
                        {popularEvents.map((event) => (
                          <div key={event.id || event._id} className="w-[80vw] sm:w-72 shrink-0">
                            <EventCard event={event} onClick={openEvent} />
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* ── Latest Posts — always shown ── */}
                  <section className="mb-10">
                    <div className="mb-4">
                      <SectionHeading title="Latest Posts" />
                    </div>
                    {isLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                      </div>
                    ) : latestPosts.length === 0 ? (
                      <EmptyState message="No events found in this category." />
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {latestPosts.map((event) => (
                            <EventCard key={event.id || event._id} event={event} onClick={openEvent} />
                          ))}
                        </div>
                        {eventsPage.totalPages > 1 && (
                          <div className="mt-8">
                            <Pagination
                              currentPage={eventsPage.currentPage}
                              totalPages={eventsPage.totalPages}
                              onPageChange={onPageChange}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </section>

                  {/* ── Influencer Events — always shown ── */}
                  <section className="mb-10">
                    <div className="mb-4">
                      <SectionHeading title="Influencer Events" />
                    </div>
                    {isLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => <SkeletonInfluencer key={i} />)}
                      </div>
                    ) : influencerEvents.length === 0 ? (
                      <EmptyState message="No influencer events yet." />
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {influencerEvents.map((event) => (
                          <InfluencerCard
                            key={event.id || event._id}
                            event={event}
                            onClick={openEvent}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                </>
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

export default EventsPage;
