import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Pagination from "../components/Pagination";
import DetailModal from "../components/DetailModal";
import { fetchTourism, fetchTourismCategories, fetchDisplayPhotos, setTourismParams } from "../state/slices/tourismSlice";
import useAnalytics from "../hooks/useAnalytics";

const EmptyState = ({ message }) => (
  <div className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}>
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const SkeletonPopularCard = () => (
  <div className="bg-white rounded-[28px] p-4 min-w-67.5 shrink-0 animate-pulse shadow-[0_8px_30px_rgba(0,0,0,0.07)]">
    <div className="h-52 rounded-2xl bg-slate-200 mb-4" />
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-slate-200 rounded w-1/2" />
  </div>
);

const SkeletonPlaceCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
    <div className="h-44 bg-slate-200" />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-full" />
    </div>
  </div>
);

const PlaceCard = ({ item, onClick }) => (
  <div
    className="bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="relative h-44">
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
      {item.category && (
        <span className="absolute top-2.5 left-2.5 bg-white/90 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
          {item.category}
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-bold text-[0.88rem] leading-snug">{item.name}</h3>
        {item.location && (
          <p className="text-white/75 text-[11px] mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />{item.location}
          </p>
        )}
      </div>
    </div>
    {item.description && (
      <div className="px-4 py-3">
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{item.description}</p>
      </div>
    )}
  </div>
);

const TourismPage = () => {
  const dispatch = useDispatch();
  const { trackCardView } = useAnalytics();
  const carouselRef = useRef(null);

  const {
    tourismList,
    displayPhotos,
    popularDestinations,
    categories,
    storedParams,
    status,
    tourismPage,
  } = useSelector((state) => state.tourism);

  const isLoading = status === "loading";
  const activeCategory = storedParams.category || "All";

  const [search, setSearch] = useState(storedParams.search || "");
  const [scope, setScope] = useState("nellore");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    dispatch(fetchTourismCategories());
    dispatch(fetchDisplayPhotos());
    dispatch(fetchTourism({ ...storedParams, scope, limit: 18 }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    const newParams = { page: 1 };
    dispatch(setTourismParams(newParams));
    dispatch(fetchTourism({ ...storedParams, ...newParams, scope: newScope, limit: 18 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { search, page: 1 };
    dispatch(setTourismParams(newParams));
    dispatch(fetchTourism({ ...storedParams, ...newParams, scope, limit: 18 }));
  };

  const handleCategoryFilter = (categoryId) => {
    const newParams = { category: categoryId, page: 1 };
    dispatch(setTourismParams(newParams));
    dispatch(fetchTourism({ ...storedParams, ...newParams, scope, limit: 18 }));
  };

  const handlePageChange = (page) => {
    const newParams = { page };
    dispatch(setTourismParams(newParams));
    dispatch(fetchTourism({ ...storedParams, ...newParams, scope, limit: 18 }));
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const openModal = (item) => {
    const id = item.id || item._id;
    if (id) trackCardView("tourism", id);
    setModal({
      item,
      actionButtons: item.directionsUrl ? [{ label: "Get Directions", url: item.directionsUrl }] : [],
    });
  };

  const scrollCarousel = (dir) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  const nonPopular = tourismList.filter((t) => !t.isPopular);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#eef7ff" }}>
      <TopHeader />
      <MainHeader />
      <Navbar />

      <main className="flex-1 overflow-x-hidden pb-16">
        <div className="w-full px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Main column */}
            <div className="flex-1 min-w-0">

              {/* ── HEADING ROW (scope toggle always top-right) ──────── */}
              <div className="flex items-start justify-between gap-4 pt-8 mb-0 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black mb-1" style={{ color: "#111" }}>Tourism</h1>
                  <p className="text-sm m-0" style={{ color: "#6c757d" }}>
                    Explore destinations in{" "}
                    <span className="font-semibold" style={{ color: "#0066cc" }}>
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
                      style={scope === s ? { background: "#0066cc", color: "#fff" } : { color: "#64748B" }}
                    >
                      {s === "nellore" ? "Nellore" : "Worldwide"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── HERO ─────────────────────────────────────────────── */}
              <section className="flex flex-col md:flex-row items-center gap-8 pt-10 pb-12">

                {/* Left text — always visible */}
                <div className="flex-1 min-w-0">
                  <h2
                    className="font-bold leading-tight mb-6"
                    style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)", color: "#111" }}
                  >
                    <span className="relative inline-block">
                      Let's
                      <span
                        className="absolute left-0 w-full rounded"
                        style={{ bottom: "6px", height: "6px", background: "#ff8c00", zIndex: -1 }}
                      />
                    </span>{" "}
                    Create Memorable Journey
                  </h2>
                  <p className={`text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 ${displayPhotos.length > 0 ? "max-w-md" : "max-w-2xl"}`} style={{ color: "#555" }}>
                    {scope === "nellore"
                      ? "Discover the hidden gems, ancient temples, and breathtaking nature of Nellore. Your perfect getaway starts right here."
                      : "Explore iconic destinations, breathtaking landscapes, and unforgettable experiences from around the world. Your journey begins here."}
                  </p>

                  {/* Search — pill style with orange button */}
                  <form
                    onSubmit={handleSearch}
                    role="search"
                    className="flex items-center bg-white rounded-full py-2 pl-6 pr-2 max-w-md"
                    style={{ boxShadow: "0 15px 30px rgba(0,102,204,0.08)" }}
                  >
                    <label htmlFor="tourism-search" className="sr-only">Search destinations</label>
                    <input
                      id="tourism-search"
                      name="search"
                      type="search"
                      autoComplete="off"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search here"
                      className="flex-1 bg-transparent text-base focus:outline-none"
                      style={{ color: "#333" }}
                    />
                    <button
                      type="submit"
                      className="w-11.25 h-11.25 rounded-full flex items-center justify-center text-white shrink-0 transition-colors"
                      style={{ background: "#ff8c00" }}
                      onMouseOver={(e) => e.currentTarget.style.background = "#e67e00"}
                      onMouseOut={(e) => e.currentTarget.style.background = "#ff8c00"}
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                {/* Right photos — only when admin has set them */}
                {displayPhotos.length > 0 && (
                  <div
                    className="w-full max-w-100 shrink-0 grid grid-cols-2 gap-5"
                    style={{ height: "500px", gridTemplateRows: "1fr 1fr" }}
                  >
                    <div
                      className="rounded-[20px] overflow-hidden transition-all duration-400 hover:-translate-y-2"
                      style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
                    >
                      <img src={displayPhotos[0]?.url || displayPhotos[0]?.image} alt="Destination 1" className="w-full h-full object-cover" />
                    </div>
                    {displayPhotos[2] && (
                      <div
                        className="rounded-[20px] overflow-hidden row-span-2 transition-all duration-400 hover:-translate-y-2"
                        style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
                      >
                        <img src={displayPhotos[2]?.url || displayPhotos[2]?.image} alt="Destination 3" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {displayPhotos[1] && (
                      <div
                        className="rounded-[20px] overflow-hidden transition-all duration-400 hover:-translate-y-2"
                        style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
                      >
                        <img src={displayPhotos[1]?.url || displayPhotos[1]?.image} alt="Destination 2" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* ── CATEGORY PILLS ───────────────────────────────────── */}
              {(isLoading || categories.length > 0) && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-10">
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
                            ? { background: "#0066cc", color: "#fff", borderColor: "#0066cc" }
                            : { background: "#fff", color: "#475569", borderColor: "#e2e8f0" }
                        }
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── POPULAR DESTINATIONS carousel ────────────────────── */}
              {(isLoading || popularDestinations.length > 0) && (
                <section className="mb-16">
                  <div className="mb-8">
                    <h4 style={{ color: "#0066cc" }} className="font-semibold mb-1 text-base">Famous Destination!</h4>
                    <h2 className="font-bold m-0" style={{ fontSize: "2.2rem", color: "#111" }}>
                      Our Popular{" "}
                      <span style={{ color: "#0066cc" }}>Destination's</span>
                    </h2>
                  </div>

                  <div className="relative my-6">
                    <button
                      onClick={() => scrollCarousel(-1)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>

                    <div
                      ref={carouselRef}
                      className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory px-1 py-3"
                    >
                      {isLoading ? (
                        [1, 2, 3].map((i) => <SkeletonPopularCard key={i} />)
                      ) : (
                        popularDestinations.map((dest) => (
                          <div
                            key={dest.id || dest._id}
                            className="bg-white rounded-[35px] p-5 min-w-67.5 shrink-0 snap-start cursor-pointer transition-all duration-400 hover:-translate-y-2"
                            style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
                            onClick={() => openModal(dest)}
                          >
                            <div className="h-60 rounded-[25px] overflow-hidden mb-5 relative">
                              {dest.image ? (
                                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-200" />
                              )}
                            </div>
                            <h3 className="text-xl font-bold mb-1" style={{ color: "#111" }}>{dest.name}</h3>
                            {dest.location && (
                              <p className="text-xs flex items-center gap-1.5" style={{ color: "#555" }}>
                                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#0066cc" }} />
                                {dest.location}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      onClick={() => scrollCarousel(1)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </section>
              )}

              {/* ── TOURIST PLACES grid ──────────────────────────────── */}
              <section className="mb-12">
                <h2 className="font-bold mb-8" style={{ fontSize: "2.2rem", color: "#111" }}>
                  Find Tourist Places
                </h2>

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonPlaceCard key={i} />)}
                  </div>
                ) : nonPopular.length === 0 ? (
                  <EmptyState message="No tourist places found." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {nonPopular.map((item) => (
                      <PlaceCard
                        key={item.id || item._id}
                        item={item}
                        onClick={() => openModal(item)}
                      />
                    ))}
                  </div>
                )}

                {tourismPage.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={tourismPage.currentPage}
                      totalPages={tourismPage.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
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

export default TourismPage;
