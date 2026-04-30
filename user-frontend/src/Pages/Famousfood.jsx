import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, MapPin } from "lucide-react";
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Pagination from "../components/Pagination";
import DetailModal from "../components/DetailModal";
import {
  fetchFamousFoods,
  fetchPopularVarieties,
  fetchDisplayPhotos,
  fetchHealthTips,
  fetchSweets,
  fetchFoodCategories,
  setFoodParams,
} from "../state/slices/famousFoodsSlice";
import useAnalytics from "../hooks/useAnalytics";

const EmptyState = ({ message }) => (
  <div className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}>
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const SectionHeading = ({ title, sub }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl sm:text-[2.2rem] font-extrabold text-[#1e293b]">{title}</h2>
    {sub && <p className="text-xs text-slate-400 italic mt-1">{sub}</p>}
  </div>
);

const SkeletonHero = () => (
  <div className="rounded-[28px] overflow-hidden animate-pulse bg-slate-200 mb-4" style={{ height: "420px" }} />
);

const SkeletonDishCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
    <div className="h-44 bg-slate-200" />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-full" />
    </div>
  </div>
);

const SkeletonHealthCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shrink-0 w-64 animate-pulse">
    <div className="h-44 bg-slate-200" />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-full" />
    </div>
  </div>
);

const SkeletonSweetCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shrink-0 w-52 animate-pulse">
    <div className="h-40 bg-slate-200" />
    <div className="p-3 flex flex-col gap-2">
      <div className="h-3 bg-slate-200 rounded w-3/4" />
      <div className="h-4 bg-slate-200 rounded w-1/2" />
    </div>
  </div>
);

const Famousfood = () => {
  const dispatch = useDispatch();
  const { trackCardView, trackPageVisit } = useAnalytics();

  useEffect(() => { trackPageVisit('foods') }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { signatureDishes, popularVarieties, displayPhotos, sweets, healthTips, categories, storedParams, status, foodsPage } =
    useSelector((state) => state.famousFoods);

  const isLoading = status === "loading";
  const activeCategory = storedParams.category || "All";

  const [search, setSearch] = useState(storedParams.search || "");
  const [scope, setScope] = useState("nellore");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    dispatch(fetchFoodCategories());
    dispatch(fetchHealthTips());
    dispatch(fetchDisplayPhotos());
    dispatch(fetchSweets({ scope }));
    dispatch(fetchPopularVarieties({ scope }));
    dispatch(fetchFamousFoods({ ...storedParams, scope }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    const newParams = { page: 1 };
    dispatch(setFoodParams(newParams));
    dispatch(fetchFamousFoods({ ...storedParams, ...newParams, scope: newScope }));
    dispatch(fetchPopularVarieties({ scope: newScope }));
    dispatch(fetchSweets({ scope: newScope }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { search, page: 1 };
    dispatch(setFoodParams(newParams));
    dispatch(fetchFamousFoods({ ...storedParams, ...newParams, scope }));
  };

  const handleCategoryFilter = (categoryId) => {
    const newParams = { category: categoryId, page: 1 };
    dispatch(setFoodParams(newParams));
    dispatch(fetchFamousFoods({ ...storedParams, ...newParams, scope }));
  };

  const handlePageChange = (page) => {
    const newParams = { page };
    dispatch(setFoodParams(newParams));
    dispatch(fetchFamousFoods({ ...storedParams, ...newParams, scope }));
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const openModal = (item) => {
    const id = item.id || item._id;
    if (id) trackCardView("foods", id);
    setModal({
      item,
      actionButtons: item.redirectUrl ? [{ label: "Order Online", url: item.redirectUrl }] : [],
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      <TopHeader />
      <MainHeader />
      <Navbar />

      <main className="flex-1 overflow-x-hidden pt-8 pb-16">
        <div className="px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Main column */}
            <div className="flex-1 min-w-0 flex flex-col gap-14">

              {/* Heading + scope */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-1">Famous Foods</h1>
                  <p className="text-sm text-slate-500 m-0">
                    Best foods in{" "}
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
                      style={scope === s ? { background: "#2563EB", color: "#fff" } : { color: "#64748B" }}
                    >
                      {s === "nellore" ? "Nellore" : "Worldwide"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── HERO PHOTOS (admin-set display photos) ───────────── */}
              {displayPhotos.length > 0 && (
                <div
                  className="w-full grid gap-4 mb-2"
                  style={{
                    gridTemplateColumns: displayPhotos.length === 1 ? "1fr" : displayPhotos.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr",
                    height: "clamp(180px, 30vw, 320px)",
                  }}
                >
                  {displayPhotos.slice(0, 3).map((photo, idx) => (
                    <div key={photo._id || idx} className="rounded-[20px] overflow-hidden">
                      <img
                        src={photo.url || photo.image}
                        alt={`Food ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              {isLoading && displayPhotos.length === 0 && <SkeletonHero />}

              {/* ── POPULAR VARIETIES ─────────────────────────────────── */}
              {(isLoading || popularVarieties.length > 0) && (
                <section>
                  <SectionHeading title="Popular Varieties" />
                  {isLoading && popularVarieties.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => <SkeletonDishCard key={i} />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {popularVarieties.map((dish) => (
                        <div
                          key={dish.id || dish._id}
                          className="bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
                          onClick={() => openModal(dish)}
                        >
                          <div className="relative h-44 overflow-hidden bg-slate-100">
                            {dish.image ? (
                              <img src={dish.image} alt={dish.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                            ) : (
                              <div className="w-full h-full bg-slate-200" />
                            )}
                            <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ★ Popular
                            </span>
                            {dish.isVerified && (
                              <span className="absolute top-2.5 right-2.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="text-base font-bold text-slate-900 mb-1">{dish.name}</h3>
                            {(dish.hotelName || dish.location) && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {dish.hotelName || dish.location}
                              </p>
                            )}
                            {dish.description && (
                              <p className="text-xs text-slate-500 line-clamp-2">{dish.description}</p>
                            )}
                            {dish.price && (
                              <p className="text-sm font-bold mt-1" style={{ color: "#ff9800" }}>₹{dish.price}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ── VARIETIES GRID ───────────────────────────────────── */}
              <section>
                <SectionHeading
                  title={`${scope === "nellore" ? "Nellore" : "World"} Food Varieties`}
                />

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-5 flex gap-2" role="search">
                  <div className="relative flex-1">
                    <label htmlFor="foods-search" className="sr-only">Search dishes</label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="foods-search"
                      name="search"
                      type="search"
                      autoComplete="off"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search dishes..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
                    Search
                  </button>
                </form>

                {/* Category pills */}
                {(isLoading || categories.length > 0) && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-6">
                    {[{ id: "All", label: "All" }, ...categories].map((cat) => {
                      const id = cat.id || cat._id;
                      const isActive = activeCategory === id;
                      return (
                        <button
                          key={id}
                          onClick={() => handleCategoryFilter(id)}
                          className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border"
                          style={isActive
                            ? { background: "#ff9800", color: "#fff", borderColor: "#ff9800" }
                            : { background: "#fff", color: "#475569", borderColor: "#e2e8f0" }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonDishCard key={i} />)}
                  </div>
                ) : signatureDishes.length === 0 ? (
                  <EmptyState message="No dishes found." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {signatureDishes.map((dish) => (
                      <div
                        key={dish.id || dish._id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
                        onClick={() => openModal(dish)}
                      >
                        <div className="relative h-44 overflow-hidden bg-slate-100">
                          {dish.image ? (
                            <img src={dish.image} alt={dish.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-slate-200" />
                          )}
                          {dish.isVerified && (
                            <span className="absolute top-2.5 right-2.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-base font-bold text-slate-900 mb-1">{dish.name}</h3>
                          {(dish.hotelName || dish.location) && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {dish.hotelName || dish.location}
                            </p>
                          )}
                          {dish.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{dish.description}</p>
                          )}
                          {dish.price && (
                            <p className="text-sm font-bold" style={{ color: "#ff9800" }}>₹{dish.price}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {foodsPage.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={foodsPage.currentPage}
                      totalPages={foodsPage.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </section>

              {/* ── HEALTH TIPS ──────────────────────────────────────── */}
              {(isLoading || healthTips.length > 0) && (
                <section>
                  <SectionHeading title="Health Tips" />
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    {isLoading && healthTips.length === 0 ? (
                      [1, 2, 3, 4].map((i) => <SkeletonHealthCard key={i} />)
                    ) : (
                      healthTips.map((tip) => (
                        <div
                          key={tip.id || tip._id}
                          className="bg-white rounded-2xl overflow-hidden border border-emerald-50 shrink-0 w-64 sm:w-72 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)] cursor-pointer"
                          onClick={() => openModal(tip)}
                        >
                          <div className="relative h-44 overflow-hidden">
                            {tip.image ? (
                              <img src={tip.image} alt={tip.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                            ) : (
                              <div className="w-full h-full bg-emerald-50" />
                            )}
                            {tip.category && (
                              <span
                                className="absolute top-3 right-3 text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full"
                                style={{ background: "#059669", backdropFilter: "blur(4px)" }}
                              >
                                {tip.category}
                              </span>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="font-extrabold text-base mb-2" style={{ color: "#064e3b" }}>{tip.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{tip.description || tip.desc}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}

              {/* ── FAMOUS SWEETS ────────────────────────────────────── */}
              {(isLoading || sweets.length > 0) && (
                <section>
                  <SectionHeading
                    title={`Famous Sweets of ${scope === "nellore" ? "Nellore" : "the World"}`}
                    sub="(Note: Food prices are approximate and may vary)"
                  />
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    {isLoading && sweets.length === 0 ? (
                      [1, 2, 3, 4, 5].map((i) => <SkeletonSweetCard key={i} />)
                    ) : (
                      sweets.map((sweet) => (
                        <div
                          key={sweet.id || sweet._id}
                          className="bg-white rounded-2xl overflow-hidden border border-slate-100 shrink-0 w-48 sm:w-56 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                          onClick={() => openModal(sweet)}
                        >
                          <div className="h-36 sm:h-40 overflow-hidden">
                            {sweet.image ? (
                              <img src={sweet.image} alt={sweet.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-200" />
                            )}
                          </div>
                          <div className="p-3">
                            {(sweet.businessName || sweet.shopName) && (
                              <p className="text-[10px] text-blue-600 font-bold capitalize mb-0.5 flex items-center gap-1">
                                <span>🏪</span>{sweet.businessName || sweet.shopName}
                              </p>
                            )}
                            <h3 className="font-bold text-sm text-slate-800 leading-snug mb-1">{sweet.name}</h3>
                            {sweet.price && (
                              <p className="text-sm font-black text-slate-700">₹{sweet.price}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
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

export default Famousfood;
