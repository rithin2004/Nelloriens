import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Grid, Bed, Phone, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Pagination from "../components/Pagination";
import DetailModal from "../components/DetailModal";
import { fetchProperties, fetchPropertyMetadata, setPropertyParams } from "../state/slices/realEstateSlice";
import useAnalytics from "../hooks/useAnalytics";

const EmptyState = ({ message }) => (
  <div
    className="col-span-full w-full flex items-center justify-center py-14 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}
  >
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const fmtPrice = (value, isRent) => {
  if (!value) return "";
  const n = Number(value);
  if (isRent) return n >= 1000 ? `₹${(n / 1000).toFixed(0)}K/mo` : `₹${n}/mo`;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
    <div className="aspect-video bg-slate-200" />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="flex gap-2 py-3 border-y border-slate-100 my-1">
        <div className="h-6 bg-slate-200 rounded-lg w-20" />
        <div className="h-6 bg-slate-200 rounded-lg w-14" />
        <div className="h-6 bg-slate-200 rounded-lg w-24" />
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="h-6 bg-slate-200 rounded w-24" />
        <div className="h-8 bg-slate-200 rounded-xl w-24" />
      </div>
    </div>
  </div>
);

const FilterLabel = ({ children }) => (
  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{children}</p>
);

const RealEstate = () => {
  const dispatch = useDispatch();
  const { trackCardView } = useAnalytics();

  const { propertiesList, categories, locations, storedParams, status, realEstatePage } =
    useSelector((state) => state.realEstate);

  const isLoading = status === "loading";
  const isRent = storedParams.status === "rent";

  const [scope, setScope] = useState("nellore");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    dispatch(fetchPropertyMetadata());
    dispatch(fetchProperties({ ...storedParams, scope }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (update) => {
    const newParams = { ...storedParams, ...update, page: 1, scope };
    dispatch(setPropertyParams({ ...update, page: 1 }));
    dispatch(fetchProperties(newParams));
  };

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    dispatch(fetchProperties({ ...storedParams, page: 1, scope: newScope }));
  };

  const handleTabChange = (tab) => {
    const newMaxPrice = tab === "sale" ? 20000000 : 100000;
    const newParams = { status: tab, page: 1, maxPrice: newMaxPrice, scope };
    dispatch(setPropertyParams({ status: tab, maxPrice: newMaxPrice, page: 1 }));
    dispatch(fetchProperties(newParams));
  };

  const handlePageChange = (page) => {
    dispatch(setPropertyParams({ page }));
    dispatch(fetchProperties({ ...storedParams, page, scope }));
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const openModal = (prop) => {
    const id = prop.id || prop._id;
    if (id) trackCardView("real-estate", id);
    setModal({ item: prop });
  };

  const pillActive = { background: "#2563EB", color: "#fff", borderColor: "#2563EB" };
  const pillIdle   = { background: "#fff", color: "#475569", borderColor: "#e2e8f0" };

  const saleMax = 50000000;
  const rentMax = 100000;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      <TopHeader />
      <MainHeader />
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <header
        className="py-14 sm:py-20 text-white text-center relative"
        style={{ background: "linear-gradient(130deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)" }}
      >
        {/* Scope toggle */}
        <div className="absolute top-5 right-5 sm:right-8 flex gap-1 bg-white/10 rounded-full p-0.5">
          {["nellore", "worldwide"].map((s) => (
            <button
              key={s}
              onClick={() => handleScopeChange(s)}
              className="px-3 py-1 rounded-full text-xs font-bold capitalize transition-all"
              style={scope === s ? { background: "#fff", color: "#1e3a8a" } : { color: "rgba(255,255,255,0.7)" }}
            >
              {s === "nellore" ? "Nellore" : "Worldwide"}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-extrabold text-white leading-tight m-0 mb-3"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Properties in{" "}
            <span style={{ color: "#93c5fd" }}>
              {scope === "nellore" ? "Nellore" : "the World"}
            </span>
          </h1>
          <p className="text-white/75 mb-8 leading-relaxed"
            style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)" }}>
            {scope === "nellore"
              ? "Verified plots, flats and houses across the city for sale and for rent. Filter by your needs."
              : "Verified properties worldwide — for sale and for rent. Filter by your needs."}
          </p>

          {/* Sale / Rent tabs */}
          <div className="inline-flex p-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
            {[["sale", "For Sale"], ["rent", "For Rent"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => handleTabChange(val)}
                className="px-6 py-2 rounded-full font-bold text-sm transition-all"
                style={storedParams.status === val
                  ? { background: "#fff", color: "#1e3a8a", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }
                  : { color: "#fff" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <main className="flex-1 pb-16">
        <div className="px-4 lg:px-10 pt-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left: Filters + Listings */}
            <div className="flex-1 min-w-0 flex flex-col xl:flex-row gap-6 items-start">

              {/* Mobile filter trigger */}
              <button
                className="xl:hidden flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl self-start"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" /> Show Filters
              </button>

              {/* Overlay */}
              {filtersOpen && (
                <div
                  className="fixed inset-0 bg-black/50 z-40 xl:hidden"
                  onClick={() => setFiltersOpen(false)}
                />
              )}

              {/* Filter sidebar */}
              <aside
                className={`
                  bg-white border border-slate-200 rounded-2xl p-6
                  xl:w-72 xl:shrink-0 xl:sticky xl:top-6 xl:self-start xl:block
                  ${filtersOpen
                    ? "fixed inset-y-0 left-0 z-50 w-80 rounded-none border-r border-t-0 border-b-0 overflow-y-auto shadow-2xl"
                    : "hidden xl:block"}
                `}
              >
                {/* Mobile header */}
                <div className="flex items-center justify-between mb-5 xl:hidden">
                  <h3 className="text-base font-black text-slate-900">Filters</h3>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search */}
                <div className="mb-5">
                  <FilterLabel>Search</FilterLabel>
                  <input
                    id="re-search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    placeholder="Search properties..."
                    defaultValue={storedParams.search}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFilterChange({ search: e.target.value });
                    }}
                    onBlur={(e) => handleFilterChange({ search: e.target.value })}
                    className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>

                {/* Property Type */}
                <div className="mb-5">
                  <FilterLabel>Property Type</FilterLabel>
                  <div className="flex flex-wrap gap-2">
                    {[{ id: "All", label: "All" }, ...categories].map((cat) => {
                      const id = cat.id || cat._id;
                      return (
                        <button
                          key={id}
                          onClick={() => handleFilterChange({ category: id })}
                          className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
                          style={storedParams.category === id ? pillActive : pillIdle}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-5">
                  <FilterLabel>Location</FilterLabel>
                  <div className="relative">
                    <select
                      id="re-location"
                      name="location"
                      value={storedParams.location}
                      onChange={(e) => handleFilterChange({ location: e.target.value })}
                      className="w-full py-2.5 pl-3 pr-8 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                    >
                      <option value="All">All Locations</option>
                      {locations.map((loc) => (
                        <option key={loc.id || loc._id} value={loc.id || loc._id}>{loc.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* BHK */}
                <div className="mb-5">
                  <FilterLabel>BHK</FilterLabel>
                  <div className="relative">
                    <select
                      id="re-bhk"
                      name="bhk"
                      value={storedParams.bhk}
                      onChange={(e) => handleFilterChange({ bhk: e.target.value })}
                      className="w-full py-2.5 pl-3 pr-8 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                    >
                      <option value="All">All BHK</option>
                      {["1 BHK", "2 BHK", "3 BHK", "4 BHK"].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Furnishing */}
                <div className="mb-5">
                  <FilterLabel>Furnishing</FilterLabel>
                  <div className="relative">
                    <select
                      id="re-furnishing"
                      name="furnishing"
                      value={storedParams.furnishing || "All"}
                      onChange={(e) => handleFilterChange({ furnishing: e.target.value })}
                      className="w-full py-2.5 pl-3 pr-8 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                    >
                      <option value="All">All</option>
                      {["Furnished", "Semi-Furnished", "Unfurnished"].map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Facing */}
                <div className="mb-5">
                  <FilterLabel>Facing</FilterLabel>
                  <div className="relative">
                    <select
                      id="re-facing"
                      name="facing"
                      value={storedParams.facing || "All"}
                      onChange={(e) => handleFilterChange({ facing: e.target.value })}
                      className="w-full py-2.5 pl-3 pr-8 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                    >
                      <option value="All">All</option>
                      {["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Price range */}
                <div className="mb-5">
                  <FilterLabel>Max Price ({isRent ? "Rent" : "Sale"})</FilterLabel>
                  <input
                    type="range"
                    className="w-full accent-blue-600 my-2"
                    min={isRent ? 5000 : 1000000}
                    max={isRent ? rentMax : saleMax}
                    step={isRent ? 1000 : 500000}
                    value={storedParams.maxPrice}
                    onChange={(e) => handleFilterChange({ maxPrice: Number(e.target.value) })}
                  />
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mt-1">
                    <span>{isRent ? "₹5K" : "₹10L"}</span>
                    <span className="text-blue-600 font-black">
                      {isRent
                        ? `₹${(storedParams.maxPrice / 1000).toFixed(0)}K`
                        : storedParams.maxPrice >= 10000000
                          ? `₹${(storedParams.maxPrice / 10000000).toFixed(1)}Cr`
                          : `₹${(storedParams.maxPrice / 100000).toFixed(0)}L`}
                    </span>
                    <span>{isRent ? "₹1L" : "₹5Cr+"}</span>
                  </div>
                </div>

                {/* Reset */}
                <button
                  onClick={() => handleFilterChange({
                    category: "All",
                    location: "All",
                    bhk: "All",
                    furnishing: "All",
                    facing: "All",
                    search: "",
                    maxPrice: isRent ? rentMax : 20000000,
                  })}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-colors mb-5"
                >
                  Reset Filters
                </button>

                {/* CTA */}
                <div className="rounded-2xl p-5 text-white"
                  style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)" }}>
                  <h4 className="font-black text-base mb-1">List your property</h4>
                  <p className="text-white/75 text-xs leading-relaxed mb-4">
                    Reach thousands of buyers and tenants across {scope === "nellore" ? "Nellore" : "the world"}.
                  </p>
                  <button className="w-full py-2.5 bg-white text-blue-700 font-black text-sm rounded-xl hover:bg-blue-50 transition-colors">
                    Contact us
                  </button>
                </div>
              </aside>

              {/* Listings grid */}
              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
                  </div>
                ) : propertiesList.length === 0 ? (
                  <div className="grid">
                    <EmptyState message="No properties found. Try adjusting your filters." />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {propertiesList.map((prop) => (
                      <div
                        key={prop.id || prop._id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col"
                        onClick={() => openModal(prop)}
                      >
                        {/* Image */}
                        <div className="relative aspect-video overflow-hidden bg-slate-100">
                          {prop.image ? (
                            <img
                              src={prop.image}
                              alt={prop.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-3xl">🏠</div>
                          )}
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
                            {prop.badge && (
                              <span className="text-xs font-black text-blue-600 px-2.5 py-1 rounded-full"
                                style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}>
                                {prop.badge}
                              </span>
                            )}
                            <span
                              className="text-xs font-black text-white px-3 py-1 rounded-full ml-auto shrink-0"
                              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                            >
                              {prop.status === "rent" ? "For Rent" : "For Sale"}
                            </span>
                          </div>
                          {prop.isVerified && (
                            <span className="absolute bottom-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        {/* Body */}
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug mb-1">
                            {prop.title}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {prop.locationAddress || prop.location}
                          </p>

                          {/* Stats */}
                          <div className="flex flex-wrap gap-2 border-y border-slate-100 py-3 mb-3">
                            {prop.area && (
                              <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                                <Grid className="w-3 h-3" /> {prop.area}
                              </span>
                            )}
                            {prop.bhk && prop.bhk !== "N/A" && (
                              <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                                <Bed className="w-3 h-3" /> {prop.bhk}
                              </span>
                            )}
                            {prop.furnishing && (
                              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                                {prop.furnishing}
                              </span>
                            )}
                            {prop.facing && (
                              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                                {prop.facing} Facing
                              </span>
                            )}
                            {prop.floor && (
                              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                                Floor {prop.floor}{prop.totalFloors ? `/${prop.totalFloors}` : ""}
                              </span>
                            )}
                            {(prop.possessionStatus || prop.readyStatus) && (
                              <span className="text-xs font-bold text-slate-400 border border-dashed border-slate-200 px-2.5 py-1 rounded-lg">
                                {prop.possessionStatus || prop.readyStatus}
                              </span>
                            )}
                          </div>

                          {/* Price + Contact */}
                          <div className="flex items-center justify-between mt-auto gap-2">
                            <p className="text-lg font-extrabold m-0" style={{ color: "#1e3a8a" }}>
                              {prop.priceLabel || fmtPrice(prop.price, isRent)}
                            </p>
                            {prop.contactNumber && (
                              <a
                                href={`tel:${prop.contactNumber}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all hover:bg-blue-600 hover:text-white"
                                style={{ background: "#EFF6FF", color: "#2563EB" }}
                              >
                                <Phone className="w-3 h-3" /> Contact
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {realEstatePage.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={realEstatePage.currentPage}
                      totalPages={realEstatePage.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
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
          actionButtons={[]}
        />
      )}
    </div>
  );
};

export default RealEstate;
