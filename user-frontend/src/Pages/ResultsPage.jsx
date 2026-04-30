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
  fetchResults,
  fetchResultCategories,
  setResultParams,
  fetchResultDetail,
} from "../state/slices/resultsSlice";
import useAnalytics from "../hooks/useAnalytics";
import { jsPDF } from "jspdf";

const EmptyState = ({ message }) => (
  <div
    className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}
  >
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const SkeletonResultCard = () => (
  <div className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse flex flex-col sm:flex-row sm:items-center gap-4">
    <div className="w-20 h-6 bg-slate-200 rounded-lg shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
    <div className="w-32 h-9 bg-slate-200 rounded-lg shrink-0" />
  </div>
);

const ResultsPage = () => {
  const dispatch = useDispatch();
  const { trackCardView, trackPageVisit } = useAnalytics();

  useEffect(() => { trackPageVisit('results') }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    resultsList  = [],
    categories   = [],
    storedParams = {},
    status       = "idle",
    resultsPage  = {},
  } = useSelector((state) => state.results || {});

  const isLoading = status === "loading";

  const [search, setSearch] = useState(storedParams.search || "");
  const [scope, setScope]   = useState("nellore");
  const [modal, setModal]   = useState(null);

  useEffect(() => {
    dispatch(fetchResultCategories());
    dispatch(fetchResults({ ...storedParams, scope: "nellore" }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    const newParams = { page: 1 };
    dispatch(setResultParams(newParams));
    dispatch(fetchResults({ ...storedParams, ...newParams, scope: newScope }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { search, page: 1 };
    dispatch(setResultParams(newParams));
    dispatch(fetchResults({ ...storedParams, ...newParams, scope }));
  };

  const handleFilterChange = (categoryId) => {
    const newParams = { category: categoryId, page: 1 };
    dispatch(setResultParams(newParams));
    dispatch(fetchResults({ ...storedParams, ...newParams, scope }));
  };

  const handlePageChange = (page) => {
    const newParams = { page };
    dispatch(setResultParams(newParams));
    dispatch(fetchResults({ ...storedParams, ...newParams, scope }));
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const generatePDF = (item) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 153);
    doc.text("Nellore Portal Results", 105, 20, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(10, 25, 200, 25);
    doc.setFontSize(16);
    const titleLines = doc.splitTextToSize(item.title, 180);
    doc.text(titleLines, 10, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Category: ${item.category} | Date: ${item.publishedDate}`, 10, 55);
    const content = item.fullContent || item.description || "Official details verified by Nellore Portal.";
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, 65);
    doc.save(`Result_${item.id}.pdf`);
  };

  const buildActionButtons = (item) => [
    ...(item.link ? [{ label: "Official Portal", url: item.link }] : []),
    ...(item.status === "published"
      ? [{ label: "Download PDF", onClick: () => generatePDF(item) }]
      : []),
  ];

  const openResult = (result) => {
    const id = result.id || result._id;
    if (id) trackCardView("results", id);

    setModal({ item: result, actionButtons: buildActionButtons(result) });

    if (!result.fullContent) {
      dispatch(fetchResultDetail(id)).then((res) => {
        if (res.payload?.data) {
          const updated = { ...result, ...res.payload.data };
          setModal({ item: updated, actionButtons: buildActionButtons(updated) });
        }
      });
    }
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
                  <h1 className="text-2xl font-black text-slate-900 mb-1">Results</h1>
                  <p className="text-sm text-slate-500 m-0">
                    Official results and announcements in{" "}
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
              <form onSubmit={handleSearch} className="mb-5 flex gap-2" role="search">
                <div className="relative flex-1">
                  <label htmlFor="results-search" className="sr-only">Search results</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="results-search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search results..."
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
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-6">
                  {[{ id: "All", label: "All Results" }, ...categories].map((cat) => {
                    const id = cat.id || cat._id;
                    const isActive = (storedParams.category || "All") === id;
                    return (
                      <button
                        key={id}
                        onClick={() => handleFilterChange(id)}
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

              {/* Results list */}
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map((i) => <SkeletonResultCard key={i} />)}
                </div>
              ) : resultsList.length === 0 ? (
                <EmptyState message="No results found." />
              ) : (
                <>
                  <div className="flex flex-col gap-3">
                    {resultsList.map((result) => {
                      const isPublished = result.status === "published";
                      return (
                        <div
                          key={result.id || result._id}
                          className={`bg-white rounded-xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-200 ${
                            isPublished ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
                          }`}
                          onClick={() => isPublished && openResult(result)}
                        >
                          <div className="shrink-0">
                            <span
                              className={`py-1 px-3 rounded-lg text-xs font-bold uppercase tracking-wide inline-flex ${
                                isPublished
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {isPublished ? "Published" : "Upcoming"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[0.95rem] font-bold text-slate-900 mb-0.5 leading-snug">
                              {result.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                              {(result.categoryLabel || result.category) && (
                                <span>{result.categoryLabel || result.category}</span>
                              )}
                              {result.publishedDate && (
                                <>
                                  <span>•</span>
                                  <span>{result.publishedDate}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <button
                              className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                                isPublished
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                              }`}
                              disabled={!isPublished}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isPublished) openResult(result);
                              }}
                            >
                              {isPublished ? "View Results" : "Coming Soon"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {resultsPage.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={resultsPage.currentPage}
                        totalPages={resultsPage.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
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

export default ResultsPage;
