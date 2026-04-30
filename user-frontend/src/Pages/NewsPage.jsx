import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Search } from "lucide-react";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Footer from "../components/Footer";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";
import TopHeader from "../components/TopHeader";
import DetailModal from "../components/DetailModal";
import { fetchNews, fetchNewsDetail, fetchNewsCategories, setNewsParams, clearNewsDetail } from "../state/slices/newsSlice";
import useAnalytics from "../hooks/useAnalytics";

// ── Helpers ────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (days  > 0) return `${days} day${days  > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  if (mins  > 0) return `${mins} min ago`;
  return "Just now";
};

// ── Empty state ────────────────────────────────────────────────────────────
const EmptyState = ({ message }) => (
  <div className="w-full flex items-center justify-center py-10 rounded-2xl" style={{ background: 'rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.07)' }}>
    <p style={{ fontSize: '0.9rem', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>{message}</p>
  </div>
);

// ── Skeleton components ────────────────────────────────────────────────────
const SkeletonImportantCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
    <div className="h-56 bg-slate-200" />
    <div className="p-5 flex flex-col gap-2.5">
      <div className="h-3 bg-slate-200 rounded w-1/4" />
      <div className="h-5 bg-slate-200 rounded w-full" />
      <div className="h-5 bg-slate-200 rounded w-4/5" />
      <div className="h-3 bg-slate-200 rounded w-3/5 mt-1" />
      <div className="h-3 bg-slate-200 rounded w-2/5" />
    </div>
  </div>
);

const SkeletonUpdateCard = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-slate-100 animate-pulse shrink-0 w-56">
    <div className="h-32 bg-slate-200" />
    <div className="p-3 flex flex-col gap-2">
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-3/4" />
    </div>
  </div>
);

const SkeletonArticleRow = () => (
  <div className="flex gap-4 bg-white rounded-xl p-4 border border-slate-100 animate-pulse">
    <div className="w-28 h-20 bg-slate-200 rounded-lg shrink-0" />
    <div className="flex-1 flex flex-col gap-2 py-1">
      <div className="h-3 bg-slate-200 rounded w-1/4" />
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-4/5" />
    </div>
  </div>
);

// ── Card components ────────────────────────────────────────────────────────
const ImportantCard = ({ article, onClick }) => (
  <div
    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    onClick={onClick}
  >
    <div className="relative h-56 overflow-hidden">
      <img
        src={article.thumbnail || article.image}
        alt={article.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
      {(article.categoryName || article.category) && (
        <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
          {article.categoryName || article.category}
        </span>
      )}
      <span className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
        {timeAgo(article.createdAt)}
      </span>
    </div>
    <div className="p-5">
      <h3 className="text-[1.05rem] font-bold text-slate-800 line-clamp-2 m-0 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
        {article.title}
      </h3>
      {(article.summary || article.description) && (
        <p className="text-[0.82rem] text-slate-500 line-clamp-2 m-0 leading-relaxed">
          {article.summary || article.description}
        </p>
      )}
    </div>
  </div>
);

const UpdateCard = ({ article, onClick }) => (
  <div
    className="group bg-white rounded-xl overflow-hidden border border-slate-100 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 shrink-0 w-56"
    onClick={onClick}
  >
    <div className="relative h-32 overflow-hidden">
      <img
        src={article.thumbnail || article.image}
        alt={article.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <div className="p-3">
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">
        {article.categoryName || article.category} · {timeAgo(article.createdAt)}
      </p>
      <h3 className="text-[0.85rem] font-bold text-slate-800 line-clamp-2 m-0 leading-snug">{article.title}</h3>
    </div>
  </div>
);

const ArticleRow = ({ article, onClick }) => (
  <div
    className="group flex gap-4 bg-white rounded-xl border border-slate-100 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    onClick={onClick}
  >
    <div className="w-28 h-20 shrink-0 overflow-hidden rounded-lg">
      <img
        src={article.thumbnail || article.image}
        alt={article.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <div className="flex-1 flex flex-col gap-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#2563EB' }}>
        {article.categoryName || article.category}
        {(article.createdAt) && (
          <span className="text-slate-400 font-normal normal-case tracking-normal">
            {" "}· {timeAgo(article.createdAt)}
          </span>
        )}
      </p>
      <h3 className="text-[0.92rem] font-bold text-slate-800 line-clamp-2 m-0 leading-snug">{article.title}</h3>
      {article.summary && (
        <p className="hidden md:block text-[0.8rem] text-slate-500 line-clamp-2 m-0">{article.summary}</p>
      )}
    </div>
  </div>
);

// ── Section heading ────────────────────────────────────────────────────────
const SectionHeading = ({ title }) => (
  <h2 className="flex items-center gap-2 text-xl font-black text-slate-800 m-0">
    <span className="w-1 h-6 rounded-full bg-blue-600 shrink-0" />
    {title}
  </h2>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const NewsPage = () => {
  const dispatch = useDispatch();
  const { id: urlId } = useParams();
  const { trackCardView, trackPageView } = useAnalytics();

  const {
    newsFeedArticles = [],
    newsFeedFilters  = [],
    storedParams     = {},
    newsPage         = {},
    currNewsDetail   = null,
    status           = "idle",
  } = useSelector((state) => state.news || {});

  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(fetchNewsCategories());
    dispatch(fetchNews(storedParams));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (urlId) {
      dispatch(fetchNewsDetail(urlId));
      trackPageView("news", urlId);
      trackCardView("news", urlId);
    } else {
      dispatch(clearNewsDetail());
    }
  }, [urlId, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Search ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState(storedParams.search || "");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = { search, page: 1 };
    dispatch(setNewsParams(newParams));
    dispatch(fetchNews({ ...storedParams, ...newParams }));
  };

  const clearSearch = () => {
    setSearch("");
    const newParams = { search: "", page: 1 };
    dispatch(setNewsParams(newParams));
    dispatch(fetchNews({ ...storedParams, ...newParams }));
  };

  // ── Modal state ──────────────────────────────────────────────────────────
  const [localModal, setLocalModal] = useState(null);

  const openArticle = (article) => {
    const id = article.id || article._id;
    if (id) { trackCardView("news", id); trackPageView("news", id); }
    setLocalModal({
      item: article,
      actionButtons: [{ label: "Read Full Article", to: `/news/${id}` }],
    });
  };

  const urlModal = useMemo(() => {
    if (!currNewsDetail) return null;
    const id = currNewsDetail.id || currNewsDetail._id;
    return { item: currNewsDetail, actionButtons: [{ label: "Read Full Article", to: `/news/${id}` }] };
  }, [currNewsDetail]);

  const modal = localModal || urlModal;
  const closeModal = () => { setLocalModal(null); dispatch(clearNewsDetail()); };

  // ── Scope ────────────────────────────────────────────────────────────────
  const handleScopeChange = (scope) => {
    const newParams = { scope, page: 1 };
    dispatch(setNewsParams(newParams));
    dispatch(fetchNews({ ...storedParams, ...newParams }));
  };

  // ── Filter ───────────────────────────────────────────────────────────────
  const handleFilterChange = (categoryId) => {
    const newParams = { category: categoryId, page: 1 };
    dispatch(setNewsParams(newParams));
    dispatch(fetchNews({ ...storedParams, ...newParams }));
  };

  const onPageChange = (page) => {
    const newParams = { page };
    dispatch(setNewsParams(newParams));
    dispatch(fetchNews({ ...storedParams, ...newParams }));
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  // ── Data splits ──────────────────────────────────────────────────────────
  const importantNews = useMemo(
    () => newsFeedArticles.filter((n) => n?.isImportant).slice(0, 6),
    [newsFeedArticles]
  );
  const nonImportant = useMemo(
    () => newsFeedArticles.filter((n) => !n?.isImportant),
    [newsFeedArticles]
  );
  const latestUpdates  = useMemo(() => nonImportant.slice(0, 6),  [nonImportant]);
  const articlesAndMore = useMemo(() => nonImportant.slice(6),    [nonImportant]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <TopHeader />
      <MainHeader />
      <Navbar />

      <main className="flex-1 overflow-x-hidden pt-8 pb-16">
        <div className="px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Main column ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Page heading + scope */}
              <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-1">News Headlines</h1>
                  <p className="text-sm text-slate-500 m-0">
                    Stay informed about{" "}
                    <span className="font-semibold text-blue-600">
                      {(storedParams.scope || "nellore") === "nellore" ? "Nellore" : "Worldwide"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-full p-0.5 self-start mt-1">
                  {["nellore", "worldwide"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleScopeChange(s)}
                      className="px-3 py-1 rounded-full text-xs font-bold capitalize transition-all"
                      style={(storedParams.scope || "nellore") === s
                        ? { background: "#2563EB", color: "#fff" }
                        : { color: "#64748B" }
                      }
                    >
                      {s === "nellore" ? "Nellore" : "Worldwide"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search bar */}
              <form onSubmit={handleSearchSubmit} className="mb-5 flex gap-2" role="search">
                <div className="relative flex-1">
                  <label htmlFor="news-search" className="sr-only">Search news</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="news-search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search news..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </form>

              {/* Category filter pills — hidden while search active or no real categories */}
              {!storedParams.search && newsFeedFilters.length > 1 && (
                <div className="mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {newsFeedFilters.map((cat) => {
                    const id = cat.id || cat._id;
                    const isActive = (storedParams.category || "All") === id;
                    return (
                      <button
                        key={id}
                        onClick={() => handleFilterChange(id)}
                        className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border"
                        style={isActive
                          ? { background: '#2563EB', color: '#fff', borderColor: '#2563EB' }
                          : { background: '#fff', color: '#475569', borderColor: '#e2e8f0' }
                        }
                      >
                        {cat.label || cat.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── SEARCH RESULTS VIEW ─────────────────────────────── */}
              {storedParams.search ? (
                <section className="mb-10">
                  <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
                    <SectionHeading title={`Results for "${storedParams.search}"`} />
                    <button onClick={clearSearch}
                      className="text-xs font-bold text-blue-600 hover:underline">
                      ✕ Clear search
                    </button>
                  </div>
                  {isLoading ? (
                    <div className="flex flex-col gap-4">
                      {[1, 2, 3].map((i) => <SkeletonArticleRow key={i} />)}
                    </div>
                  ) : newsFeedArticles.length === 0 ? (
                    <EmptyState message={`No results for "${storedParams.search}".`} />
                  ) : (
                    <>
                      <div className="flex flex-col gap-4">
                        {newsFeedArticles.map((article) => (
                          <ArticleRow
                            key={article.id || article._id}
                            article={article}
                            onClick={() => openArticle(article)}
                          />
                        ))}
                      </div>
                      {newsPage.totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                          <Pagination
                            currentPage={newsPage.currentPage}
                            totalPages={newsPage.totalPages}
                            onPageChange={onPageChange}
                          />
                        </div>
                      )}
                    </>
                  )}
                </section>
              ) : (
              <>
              {/* ── SECTION 1: IMPORTANT NEWS ───────────────────────── */}
              <section className="mb-10">
                <div className="mb-5">
                  <SectionHeading title="Important News" />
                </div>
                {isLoading ? (
                  <div className="flex flex-col gap-5">
                    {[1, 2].map((i) => <SkeletonImportantCard key={i} />)}
                  </div>
                ) : importantNews.length === 0 ? (
                  <EmptyState message="No important news at the moment." />
                ) : (
                  <div className="flex flex-col gap-5">
                    {importantNews.map((article) => (
                      <ImportantCard
                        key={article.id || article._id}
                        article={article}
                        onClick={() => openArticle(article)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* ── SECTION 2: LATEST UPDATES (6 most recent) ───────── */}
              <section className="mb-10">
                <div className="mb-5">
                  <SectionHeading title="Latest News" />
                </div>
                {isLoading ? (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {[1, 2, 3, 4].map((i) => <SkeletonUpdateCard key={i} />)}
                  </div>
                ) : latestUpdates.length === 0 ? (
                  <EmptyState message="No recent updates." />
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {latestUpdates.map((article) => (
                      <UpdateCard
                        key={article.id || article._id}
                        article={article}
                        onClick={() => openArticle(article)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* ── SECTION 3: ARTICLES & MORE (remaining) ──────────── */}
              <section className="mb-10">
                <div className="mb-5">
                  <SectionHeading title="Articles & More" />
                </div>
                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => <SkeletonArticleRow key={i} />)}
                  </div>
                ) : articlesAndMore.length === 0 ? (
                  <EmptyState message="No more articles." />
                ) : (
                  <div className="flex flex-col gap-4">
                    {articlesAndMore.map((article) => (
                      <ArticleRow
                        key={article.id || article._id}
                        article={article}
                        onClick={() => openArticle(article)}
                      />
                    ))}
                  </div>
                )}

                {newsPage.totalPages > 1 && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    {newsPage.currentPage && (
                      <p className="text-sm text-slate-400">
                        Showing {((newsPage.currentPage - 1) * 20) + 1}–{Math.min(newsPage.currentPage * 20, newsPage.totalPages * 20)} articles
                      </p>
                    )}
                    <Pagination
                      currentPage={newsPage.currentPage}
                      totalPages={newsPage.totalPages}
                      onPageChange={onPageChange}
                    />
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
          onClose={closeModal}
          actionButtons={modal.actionButtons}
        />
      )}
    </div>
  );
};

export default NewsPage;
