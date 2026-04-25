import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Pagination from "../components/Pagination";
import DetailModal from "../components/DetailModal";
import {
  fetchFamousStays,
  fetchStayCategories,
  setStayParams,
} from "../state/slices/famousStaysSlice";
import useAnalytics from "../hooks/useAnalytics";

const EmptyState = ({ message }) => (
  <div
    className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}
  >
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const SectionHeading = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 bg-red-500 rounded-sm shrink-0" />
      <h2 className="text-lg font-black text-slate-900 m-0">{title}</h2>
    </div>
    {action}
  </div>
);

const SkeletonFeatured = () => (
  <div className="rounded-2xl overflow-hidden animate-pulse bg-slate-200 mb-10" style={{ height: "320px" }} />
);

const SkeletonPopularCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
    <div className="w-full h-44 bg-slate-200" />
    <div className="p-3 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-1/3" />
    </div>
  </div>
);

const FeaturedCard = ({ stay, onClick }) => (
  <div
    className="relative rounded-2xl overflow-hidden cursor-pointer group mb-10"
    style={{ height: "320px" }}
    onClick={onClick}
  >
    {stay.image ? (
      <img
        src={stay.image}
        alt={stay.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    ) : (
      <div className="w-full h-full bg-slate-300" />
    )}
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)" }}
    />
    <div className="absolute top-4 left-4">
      <span className="bg-blue-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider">
        Featured Stay
      </span>
    </div>
    {stay.rating && (
      <span className="absolute top-4 right-4 bg-white/90 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full">
        ★ {stay.rating}
      </span>
    )}
    <div className="absolute bottom-0 left-0 right-0 p-5">
      <h3 className="text-white font-black text-xl leading-tight">{stay.name}</h3>
      {stay.location && (
        <p className="text-white/75 text-sm mt-1">{stay.location}</p>
      )}
      <div className="flex items-center justify-between mt-4">
        {stay.price ? (
          <span className="text-white font-bold text-base">
            ₹{stay.price}
            <span className="text-white/65 font-normal text-sm">/night</span>
          </span>
        ) : <span />}
        <button
          className="bg-white text-slate-900 text-sm font-bold px-5 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          Book Now
        </button>
      </div>
    </div>
  </div>
);

const StayCard = ({ stay, onClick }) => (
  <div
    className="bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    onClick={onClick}
  >
    <div className="relative h-44">
      {stay.image ? (
        <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-slate-200" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 55%)" }}
      />
      {stay.rating && (
        <span className="absolute top-2.5 left-2.5 bg-white/90 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
          ★ {stay.rating}
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-bold text-[0.85rem] leading-snug">{stay.name}</h3>
        {stay.location && (
          <p className="text-white/75 text-[11px] mt-0.5">{stay.location}</p>
        )}
      </div>
    </div>
    <div className="px-3 py-2.5 flex items-center justify-between">
      {stay.price ? (
        <span className="text-slate-900 font-bold text-sm">
          ₹{stay.price}
          <span className="text-slate-400 font-normal text-xs">/night</span>
        </span>
      ) : <span />}
      <button
        className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        Book
      </button>
    </div>
  </div>
);

const FamousStayPage = () => {
  const dispatch = useDispatch();
  const { trackCardView } = useAnalytics();

  const {
    topPicks     = [],
    categories   = [],
    storedParams = {},
    status       = "idle",
    staysPage    = {},
  } = useSelector((state) => state.famousStays || {});

  const isLoading      = status === "loading";
  const activeCategory = storedParams.category || "All";

  const [search, setSearch]     = useState(storedParams.search || "");
  const [scope, setScope]       = useState("nellore");
  const [showAll, setShowAll]   = useState(false);
  const [modal, setModal]       = useState(null);

  useEffect(() => {
    dispatch(fetchStayCategories());
    dispatch(fetchFamousStays({ ...storedParams, scope: "nellore" }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    setShowAll(false);
    const newParams = { page: 1 };
    dispatch(setStayParams(newParams));
    dispatch(fetchFamousStays({ ...storedParams, ...newParams, scope: newScope }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowAll(false);
    const newParams = { search, page: 1 };
    dispatch(setStayParams(newParams));
    dispatch(fetchFamousStays({ ...storedParams, ...newParams, scope }));
  };

  const handleCategoryFilter = (categoryId) => {
    setShowAll(false);
    const newParams = { category: categoryId, page: 1 };
    dispatch(setStayParams(newParams));
    dispatch(fetchFamousStays({ ...storedParams, ...newParams, scope }));
  };

  const onPageChange = (page) => {
    const newParams = { page };
    dispatch(setStayParams(newParams));
    dispatch(fetchFamousStays({ ...storedParams, ...newParams, scope }));
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const openStay = (stay) => {
    const id = stay.id || stay._id;
    if (id) trackCardView("famousStays", id);
    setModal({
      item: stay,
      actionButtons: stay.bookingUrl ? [{ label: "Book Now", url: stay.bookingUrl }] : [],
    });
  };

  // topOrder === 1 is Featured; remaining isTop items are Popular.
  // Falls back to first item if topOrder is not set (graceful degradation).
  const featured     = topPicks.find((s) => s.topOrder === 1) || topPicks[0] || null;
  const popularPool  = topPicks.filter((s) => !(featured && (s.id || s._id) === (featured.id || featured._id)));
  const popularStays = popularPool.slice(0, 6);
  const remaining    = popularPool.slice(6);

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
                  <h1 className="text-2xl font-black text-slate-900 mb-1">Famous Stay</h1>
                  <p className="text-sm text-slate-500 m-0">
                    Best places to stay in{" "}
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
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
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
                className="mb-7 rounded-2xl sm:rounded-3xl p-5 sm:p-8 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)" }}
              >
                <p className="text-blue-200 text-[11px] font-bold uppercase tracking-widest mb-3">
                  Live Availability · {scope === "nellore" ? "Nellore, AP" : "Worldwide"}
                </p>
                <h2 className="text-xl sm:text-[1.75rem] font-black text-white mb-1.5 leading-tight">
                  Find Your Perfect Stay{" "}
                  <span className="text-blue-200">
                    in {scope === "nellore" ? "Nellore" : "Worldwide"}
                  </span>
                </h2>
                <p className="text-blue-100/80 text-sm mb-5 m-0">
                  Hotels, resorts &amp; heritage gems — handpicked for every budget and taste.
                </p>
                <form onSubmit={handleSearch} className="flex gap-2 max-w-lg" role="search">
                  <div className="relative flex-1">
                    <label htmlFor="stay-search" className="sr-only">Search stays</label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="stay-search"
                      name="search"
                      type="search"
                      autoComplete="off"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by hotel name, area or type..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border-0 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/40"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
                  >
                    Search Stays
                  </button>
                </form>
              </div>

              {/* Category filter */}
              {(isLoading || categories.length > 0) && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-7">
                  {[{ id: "All", label: "All" }, ...categories].map((cat) => {
                    const id = cat.id || cat._id;
                    const isActive = activeCategory === id;
                    return (
                      <button
                        key={id}
                        onClick={() => handleCategoryFilter(id)}
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

              {/* Featured Stay */}
              {isLoading ? (
                <SkeletonFeatured />
              ) : featured ? (
                <>
                  <SectionHeading title="Featured Stay" />
                  <FeaturedCard stay={featured} onClick={() => openStay(featured)} />
                </>
              ) : null}

              {/* Popular Stays + View All */}
              <section>
                <SectionHeading
                  title="Popular Stays"
                  action={
                    !showAll && remaining.length > 0 ? (
                      <button
                        onClick={() => setShowAll(true)}
                        className="text-sm font-bold text-blue-600 hover:underline"
                      >
                        View All {remaining.length + popularStays.length} →
                      </button>
                    ) : null
                  }
                />

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonPopularCard key={i} />)}
                  </div>
                ) : popularStays.length === 0 ? (
                  <EmptyState message="No stays found." />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {(showAll ? popularPool : popularStays).map((stay) => (
                        <StayCard
                          key={stay.id || stay._id}
                          stay={stay}
                          onClick={() => openStay(stay)}
                        />
                      ))}
                    </div>

                    {/* Pagination only in View All mode */}
                    {showAll && staysPage.totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination
                          currentPage={staysPage.currentPage}
                          totalPages={staysPage.totalPages}
                          onPageChange={onPageChange}
                        />
                      </div>
                    )}

                    {/* Collapse back */}
                    {showAll && (
                      <div className="mt-6 flex justify-center">
                        <button
                          onClick={() => { setShowAll(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="text-sm font-bold text-slate-500 hover:text-slate-700"
                        >
                          Show Less
                        </button>
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

export default FamousStayPage;
