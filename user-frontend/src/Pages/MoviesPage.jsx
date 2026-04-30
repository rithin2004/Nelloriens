import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, MapPin } from "lucide-react";
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Pagination from "../components/Pagination";
import DetailModal from "../components/DetailModal";
import {
  fetchMovies,
  fetchTheaters,
  fetchMoviesByTheatre,
  setMovieParams,
} from "../state/slices/moviesSlice";
import useAnalytics from "../hooks/useAnalytics";

const EmptyState = ({ message }) => (
  <div
    className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}
  >
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const SectionHeading = ({ title, sub }) => (
  <div>
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 bg-blue-600 rounded-sm shrink-0" />
      <h2 className="text-xl font-black text-slate-900 m-0">{title}</h2>
    </div>
    {sub && <p className="text-xs text-slate-400 mt-1 ml-4">{sub}</p>}
  </div>
);

const MOVIES_DEFAULT = 6;
const THEATERS_DEFAULT = 3;

const MoviesPage = () => {
  const dispatch = useDispatch();
  const { trackCardView, trackPageVisit } = useAnalytics();

  useEffect(() => { trackPageVisit('movies') }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { currentMovies, upcomingMovies, theaters, moviesByTheatre, storedParams, status, moviesPage } =
    useSelector((state) => state.movies);

  const isLoading = status === "loading";

  const [scope, setScope] = useState("nellore");
  const [showAllMovies, setShowAllMovies] = useState(false);
  const [showAllTheaters, setShowAllTheaters] = useState(false);
  const [expandedTheater, setExpandedTheater] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    dispatch(fetchTheaters({ scope }));
    dispatch(fetchMovies({ ...storedParams, scope }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    setShowAllMovies(false);
    setShowAllTheaters(false);
    setExpandedTheater(null);
    dispatch(setMovieParams({ page: 1 }));
    dispatch(fetchMovies({ ...storedParams, page: 1, scope: newScope }));
    dispatch(fetchTheaters({ scope: newScope }));
  };

  const handlePageChange = (page) => {
    const newParams = { page };
    dispatch(setMovieParams(newParams));
    dispatch(fetchMovies({ ...storedParams, ...newParams, scope }));
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const toggleTheater = (id) => {
    if (expandedTheater === id) {
      setExpandedTheater(null);
    } else {
      setExpandedTheater(id);
      if (!moviesByTheatre[id]) dispatch(fetchMoviesByTheatre(id));
    }
  };

  const openModal = (movie) => {
    const id = movie.id || movie._id;
    if (id) trackCardView("movies", id);
    const actions = [];
    if (movie.trailerUrl) actions.push({ label: "Watch Trailer", url: movie.trailerUrl });
    if (movie.bookingUrl) actions.push({ label: "Book Now", url: movie.bookingUrl });
    setModal({ item: movie, actionButtons: actions });
  };

  const visibleNowShowing = showAllMovies ? currentMovies : currentMovies.slice(0, MOVIES_DEFAULT);
  const visibleTheaters = showAllTheaters ? theaters : theaters.slice(0, THEATERS_DEFAULT);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      <TopHeader />
      <MainHeader />
      <Navbar />

      <main className="flex-1 overflow-x-hidden pt-8 pb-16">
        <div className="px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Main column */}
            <div className="flex-1 min-w-0 flex flex-col gap-12">

              {/* Heading + scope */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 m-0 mb-1">
                    Cinema <span className="text-blue-600">{scope === "nellore" ? "Nellore" : "Worldwide"}</span>
                  </h1>
                  <p className="text-sm text-slate-500 m-0">
                    Films, screenings and theater schedules in{" "}
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

              {/* ── UPCOMING MOVIES ──────────────────────────────────── */}
              <section>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <h2 className="text-base font-black text-slate-800 m-0">Upcoming Movies</h2>
                </div>

                {isLoading && upcomingMovies.length === 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="shrink-0 w-44 sm:w-48 bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                        <div className="bg-slate-200" style={{ height: "220px" }} />
                        <div className="p-3">
                          <div className="h-3 bg-slate-200 rounded w-3/4 mb-2" />
                          <div className="h-2 bg-slate-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingMovies.length === 0 ? (
                  <EmptyState message="No upcoming movies at this time." />
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {upcomingMovies.map((movie) => (
                      <div
                        key={movie.id || movie._id}
                        className="shrink-0 w-44 sm:w-48 bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                        onClick={() => openModal(movie)}
                      >
                        <div className="overflow-hidden bg-slate-100" style={{ height: "clamp(180px, 28vw, 240px)" }}>
                          {movie.poster ? (
                            <img
                              src={movie.poster}
                              alt={movie.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-4xl">🎬</div>
                          )}
                        </div>
                        <div className="p-3 text-center">
                          <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mb-0.5">{movie.title}</h3>
                          {movie.genre && (
                            <span className="text-xs text-blue-600 font-bold uppercase tracking-wide">{movie.genre}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ── NOW SHOWING ──────────────────────────────────────── */}
              <section>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <SectionHeading title="Now Showing" />
                  {!showAllMovies && currentMovies.length > MOVIES_DEFAULT && (
                    <button
                      onClick={() => setShowAllMovies(true)}
                      className="text-sm font-bold text-blue-600 hover:underline shrink-0"
                    >
                      View All {currentMovies.length} →
                    </button>
                  )}
                  {showAllMovies && (
                    <button
                      onClick={() => setShowAllMovies(false)}
                      className="text-sm font-bold text-slate-400 hover:underline shrink-0"
                    >
                      Show Less
                    </button>
                  )}
                </div>

                {isLoading && currentMovies.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                        <div className="bg-slate-200 aspect-video" />
                        <div className="p-4 flex flex-col gap-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-200 rounded w-full" />
                          <div className="h-3 bg-slate-200 rounded w-4/5" />
                          <div className="flex gap-2 mt-2">
                            <div className="h-8 bg-slate-200 rounded-xl flex-1" />
                            <div className="h-8 bg-slate-200 rounded-xl w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : currentMovies.length === 0 ? (
                  <EmptyState message="No movies currently showing." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {visibleNowShowing.map((movie) => (
                      <div
                        key={movie.id || movie._id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col"
                        onClick={() => openModal(movie)}
                      >
                        <div className="relative overflow-hidden aspect-video bg-slate-100">
                          {movie.poster ? (
                            <img
                              src={movie.poster}
                              alt={movie.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-4xl">🎬</div>
                          )}
                          {movie.genre && (
                            <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-black uppercase px-2 py-0.5 rounded-lg">
                              {movie.genre}
                            </span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{movie.title}</h3>
                          {movie.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{movie.description}</p>
                          )}
                          <div className="mt-auto flex gap-2 flex-wrap">
                            {movie.bookingUrl && (
                              <button
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-colors"
                                onClick={(e) => { e.stopPropagation(); window.open(movie.bookingUrl, "_blank"); }}
                              >
                                Book Now
                              </button>
                            )}
                            {movie.trailerUrl && (
                              <button
                                className="px-4 py-2 border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 text-xs font-bold rounded-xl transition-colors"
                                onClick={(e) => { e.stopPropagation(); openModal(movie); }}
                              >
                                Trailer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showAllMovies && moviesPage.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={moviesPage.currentPage}
                      totalPages={moviesPage.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </section>

              {/* ── THEATERS ─────────────────────────────────────────── */}
              <section>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <SectionHeading
                    title={scope === "nellore" ? "Nellore Theaters" : "Worldwide Theaters"}
                    sub="Select a theater to see showtimes"
                  />
                  {!showAllTheaters && theaters.length > THEATERS_DEFAULT && (
                    <button
                      onClick={() => setShowAllTheaters(true)}
                      className="text-sm font-bold text-blue-600 hover:underline shrink-0"
                    >
                      View All {theaters.length} →
                    </button>
                  )}
                  {showAllTheaters && (
                    <button
                      onClick={() => setShowAllTheaters(false)}
                      className="text-sm font-bold text-slate-400 hover:underline shrink-0"
                    >
                      Show Less
                    </button>
                  )}
                </div>

                {isLoading && theaters.length === 0 ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 rounded w-40 mb-2" />
                          <div className="h-3 bg-slate-200 rounded w-28" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : theaters.length === 0 ? (
                  <EmptyState message="No theaters found." />
                ) : (
                  <div className="space-y-3">
                    {visibleTheaters.map((theater) => {
                      const theatreMovies = moviesByTheatre[theater.id] || [];
                      const isExpanded = expandedTheater === theater.id;
                      const loadingMovies = isExpanded && !moviesByTheatre[theater.id];

                      return (
                        <div
                          key={theater.id}
                          className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
                          style={{
                            border: `1px solid ${isExpanded ? "#2563EB" : "#e2e8f0"}`,
                          }}
                        >
                          <div
                            className="flex items-center justify-between p-5 cursor-pointer"
                            onClick={() => toggleTheater(theater.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-lg">
                                🎬
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">{theater.name}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {theater.location || theater.address || "Nellore"}
                                </p>
                              </div>
                            </div>
                            <ChevronDown
                              className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200"
                              style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                            />
                          </div>

                          {isExpanded && (
                            <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                              {loadingMovies ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {[1, 2].map((i) => (
                                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                                      <div className="flex gap-2">
                                        <div className="h-6 bg-slate-200 rounded-lg w-16" />
                                        <div className="h-6 bg-slate-200 rounded-lg w-16" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : theatreMovies.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No movies currently showing at this theater.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {theatreMovies.map((m) => (
                                    <div key={m.id || m._id} className="bg-white rounded-xl border border-slate-100 p-4">
                                      <h5 className="text-sm font-bold text-slate-800 mb-2">{m.title || m.movieName}</h5>
                                      {m.showTimings && m.showTimings.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                          {m.showTimings.map((time, ti) => (
                                            <span
                                              key={ti}
                                              className="px-2.5 py-1 text-xs font-bold rounded-lg"
                                              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
                                            >
                                              {time}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {m.bookingUrl && (
                                        <a
                                          href={m.bookingUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-block px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Book Now
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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

export default MoviesPage;
