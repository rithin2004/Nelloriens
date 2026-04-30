import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Pagination from "../components/Pagination";
import DetailModal from "../components/DetailModal";
import { fetchHistory, setHistoryParams } from "../state/slices/historySlice";
import useAnalytics from "../hooks/useAnalytics";

const EmptyState = ({ message }) => (
  <div className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}>
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const STATS = [
  { value: "2000+", label: "YEARS OF HISTORY" },
  { value: "3", label: "MAJOR DYNASTIES" },
  { value: "12+", label: "HERITAGE SITES" },
];

const HistoryPage = () => {
  const dispatch = useDispatch();
  const { trackCardView, trackPageView } = useAnalytics();

  const { timelineData, historyEras, storedParams, status, historyPage } =
    useSelector((state) => state.history);

  const isLoading = status === "loading";
  const activeEra = storedParams.category || "All";

  const [modal, setModal] = useState(null);

  useEffect(() => {
    dispatch(fetchHistory(storedParams));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEraFilter = (era) => {
    const newParams = { category: era, page: 1 };
    dispatch(setHistoryParams(newParams));
    dispatch(fetchHistory({ ...storedParams, ...newParams }));
  };

  const handlePageChange = (page) => {
    const newParams = { page };
    dispatch(setHistoryParams(newParams));
    dispatch(fetchHistory({ ...storedParams, ...newParams }));
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const openModal = (item) => {
    const id = item.id || item._id;
    if (id) { trackCardView("history", id); trackPageView("history", id); }
    setModal({ item });
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

              {/* ── HERO ─────────────────────────────────────────────── */}
              <div
                className="rounded-2xl overflow-hidden relative p-8 sm:p-10 mb-8"
                style={{
                  background: "linear-gradient(135deg, #0A1628 0%, #1A3A6B 60%, #1A6FD4 100%)",
                  minHeight: "200px",
                }}
              >
                <div
                  className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-5"
                  style={{ fontSize: "clamp(80px, 14vw, 150px)", lineHeight: 1 }}
                >
                  🏛️
                </div>

                <div className="relative z-10">
                  <div className="text-xs text-white/50 mb-4 flex items-center gap-1.5">
                    Home <span className="opacity-50">›</span> Nellore History
                  </div>
                  <h1
                    className="font-extrabold text-white tracking-tight leading-tight m-0 mb-3"
                    style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}
                  >
                    History of Nellore
                  </h1>
                  <p className="text-sm sm:text-base text-white/75 leading-relaxed mb-8 max-w-lg">
                    From ancient kingdoms to a modern city — 2000+ years of rich heritage, culture, and tradition.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {STATS.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl px-5 py-3 text-center"
                        style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
                      >
                        <div className="text-xl sm:text-2xl font-black text-white">{s.value}</div>
                        <div className="text-white/60 uppercase tracking-widest mt-0.5"
                          style={{ fontSize: "0.6rem", fontWeight: 700 }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── ERA PILLS ────────────────────────────────────────── */}
              {(isLoading || historyEras.length > 0) && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-8">
                  {[{ id: "All", label: "All Eras" }, ...historyEras.map((e) => ({ id: e, label: e }))].map((era) => {
                    const isActive = activeEra === era.id;
                    return (
                      <button
                        key={era.id}
                        onClick={() => handleEraFilter(era.id)}
                        className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border"
                        style={
                          isActive
                            ? { background: "#2563EB", color: "#fff", borderColor: "#2563EB" }
                            : { background: "#fff", color: "#475569", borderColor: "#e2e8f0" }
                        }
                      >
                        {era.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── TIMELINE ─────────────────────────────────────────── */}
              <h2 className="text-xl font-black text-slate-900 mb-6">Historical Timeline</h2>

              {isLoading ? (
                <div className="relative py-2">
                  <div
                    className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 lg:-translate-x-1/2"
                    style={{ background: "linear-gradient(to bottom, #1A6FD4, #E5E7EB)" }}
                  />
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex items-start mb-10 relative flex-row ${i % 2 === 0 ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
                      <div className="absolute left-4 lg:left-1/2 top-6 -translate-x-1/2 w-4 h-4 bg-slate-200 rounded-full z-10 animate-pulse" />
                      <div className="ml-10 w-full lg:ml-0 lg:w-[44%] bg-white rounded-xl border border-slate-100 p-6 animate-pulse">
                        <div className="h-5 bg-slate-200 rounded-full w-24 mb-3" />
                        <div className="h-4 bg-slate-200 rounded w-40 mb-2" />
                        <div className="h-3 bg-slate-200 rounded w-full mb-1" />
                        <div className="h-3 bg-slate-200 rounded w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : timelineData.length === 0 ? (
                <EmptyState message="No history entries found for this era." />
              ) : (
                <div className="relative py-2">
                  <div
                    className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 lg:-translate-x-1/2"
                    style={{ background: "linear-gradient(to bottom, #1A6FD4, #E5E7EB)" }}
                  />

                  {timelineData.map((item, index) => (
                    <div
                      key={item.id || item._id || index}
                      className={`flex items-start mb-10 relative flex-row ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                    >
                      {/* dot */}
                      <div
                        className="absolute left-4 lg:left-1/2 top-7 -translate-x-1/2 w-4 h-4 rounded-full border-[3px] border-white z-10 shrink-0"
                        style={{ background: "#1A6FD4", boxShadow: "0 0 0 3px rgba(26,111,212,0.25)" }}
                      />

                      {/* card */}
                      <div
                        className="ml-10 w-full lg:ml-0 lg:w-[44%] bg-white rounded-xl border border-slate-200 p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg"
                        onClick={() => openModal(item)}
                      >
                        <span
                          className="inline-block text-xs font-bold tracking-wide uppercase px-3 py-1 rounded-full mb-2"
                          style={{ background: "#EFF6FF", color: "#1A6FD4" }}
                        >
                          {item.categoryLabel || item.category || "Historical Era"}
                        </span>
                        <div className="text-sm font-extrabold text-blue-600 mb-1">{item.title}</div>
                        {item.period && (
                          <div className="text-xs text-slate-400 font-semibold mb-1">{item.period}</div>
                        )}
                        <div className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {historyPage.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={historyPage.currentPage}
                    totalPages={historyPage.totalPages}
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
          actionButtons={[]}
        />
      )}
    </div>
  );
};

export default HistoryPage;
