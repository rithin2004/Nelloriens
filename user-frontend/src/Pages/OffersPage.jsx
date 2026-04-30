import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Clock, MapPin, Tag } from 'lucide-react';
import { fetchOffers, fetchOfferCategories, setOfferParams } from '../state/slices/offersSlice';
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import DetailModal from "../components/DetailModal";
import Pagination from "../components/Pagination";
import useAnalytics from "../hooks/useAnalytics";

const EmptyState = ({ message }) => (
  <div className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}>
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const SkeletonOfferCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
    <div className="h-40 bg-slate-200" />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-4/5" />
      <div className="h-8 bg-slate-200 rounded-xl mt-3" />
    </div>
  </div>
);

const isExpiringSoon = (date) => {
  if (!date) return false;
  const diff = new Date(date) - new Date();
  return diff <= 48 * 60 * 60 * 1000 && diff > 0;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });
  } catch { return dateStr; }
};

const OfferCard = ({ offer, onClick }) => (
  <div
    className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    onClick={onClick}
  >
    {/* Image */}
    <div className="relative h-40 overflow-hidden">
      {offer.imageUrl ? (
        <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
      ) : (
        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
          <Tag className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
      {/* Category badge */}
      {offer.category && (
        <span className="absolute top-3 left-3 bg-white/90 text-blue-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
          {offer.category}
        </span>
      )}
      {/* Discount badge */}
      {offer.discount && (
        <span className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-lg">
          {offer.discount}
        </span>
      )}
      {offer.isVerified && (
        <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          ✓ Verified
        </span>
      )}
    </div>

    {/* Body */}
    <div className="p-4 flex flex-col flex-1">
      <h3 className="text-[0.9rem] font-bold text-slate-800 leading-snug mb-0.5 line-clamp-1">{offer.title}</h3>
      {offer.businessName && (
        <p className="text-blue-600 text-xs font-black mb-1 capitalize">{offer.businessName}</p>
      )}
      {offer.offerType && (
        <span className="self-start text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-2" style={{ background: "#FFF7ED", color: "#EA580C" }}>
          {offer.offerType}
        </span>
      )}
      {offer.description && (
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">{offer.description}</p>
      )}

      <div className="mt-auto space-y-3">
        {/* Meta */}
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          {offer.validUntil && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> EXP: {formatDate(offer.validUntil)}
            </span>
          )}
          {offer.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {offer.location}
            </span>
          )}
        </div>

        {/* Expiring soon */}
        {isExpiringSoon(offer.validUntil) && (
          <div className="bg-red-50 text-red-600 text-[10px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Expiring Soon!
          </div>
        )}

        {/* Coupon code */}
        {offer.couponCode && (
          <div className="text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Coupon Code</p>
            <p className="text-sm font-black text-slate-800 tracking-widest">{offer.couponCode}</p>
          </div>
        )}

        {/* Claim button */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] py-2.5 rounded-xl transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (offer.redirectUrl) window.open(offer.redirectUrl, "_blank");
            else onClick();
          }}
        >
          Claim Offer
        </button>

        {/* Call now */}
        {offer.phone && (
          <a
            href={`tel:${offer.phone}`}
            className="block text-center text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            📞 Call Now
          </a>
        )}
      </div>
    </div>
  </div>
);

const OffersPage = () => {
  const dispatch = useDispatch();
  const { trackCardView, trackPageVisit } = useAnalytics();

  useEffect(() => { trackPageVisit('offers') }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { offersList, categories, storedParams, status, offersPage } = useSelector((state) => state.offers);
  const isLoading = status === "loading";
  const activeCategory = storedParams.category || "All";
  const activeOffers = offersList.filter((o) => !o.validUntil || new Date(o.validUntil) > new Date());

  const [search, setSearch] = useState(storedParams.search || "");
  const [scope, setScope] = useState("nellore");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    dispatch(fetchOfferCategories());
    dispatch(fetchOffers({ ...storedParams, scope }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    const newParams = { page: 1 };
    dispatch(setOfferParams(newParams));
    dispatch(fetchOffers({ ...storedParams, ...newParams, scope: newScope }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { search, page: 1 };
    dispatch(setOfferParams(newParams));
    dispatch(fetchOffers({ ...storedParams, ...newParams, scope }));
  };

  const handleCategoryFilter = (categoryId) => {
    const newParams = { category: categoryId, page: 1 };
    dispatch(setOfferParams(newParams));
    dispatch(fetchOffers({ ...storedParams, ...newParams, scope }));
  };

  const handlePageChange = (page) => {
    const newParams = { page };
    dispatch(setOfferParams(newParams));
    dispatch(fetchOffers({ ...storedParams, ...newParams, scope }));
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const openModal = (offer) => {
    const id = offer.id || offer._id;
    if (id) trackCardView("offers", id);
    setModal({
      item: offer,
      actionButtons: offer.redirectUrl ? [{ label: "Claim Offer", url: offer.redirectUrl }] : [],
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
            <div className="flex-1 min-w-0">

              {/* Heading + scope */}
              <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-1">Exclusive Offers</h1>
                  <p className="text-sm text-slate-500 m-0">
                    Premium deals in{" "}
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

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-5 flex gap-2" role="search">
                <div className="relative flex-1">
                  <label htmlFor="offers-search" className="sr-only">Search offers</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="offers-search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search offers, stores, deals..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </form>

              {/* Category pills */}
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

              {/* Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1,2,3,4,5,6].map((i) => <SkeletonOfferCard key={i} />)}
                </div>
              ) : activeOffers.length === 0 ? (
                <EmptyState message="No active offers found. Try a different category or search." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeOffers.map((offer) => (
                    <OfferCard
                      key={offer.id || offer._id}
                      offer={offer}
                      onClick={() => openModal(offer)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {offersPage.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={offersPage.currentPage}
                    totalPages={offersPage.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
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

export default OffersPage;
