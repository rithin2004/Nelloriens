import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, MapPin, IndianRupee, Calendar } from "lucide-react";
import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SidebarContent from "../components/ContentSections/SidebarContent";
import Pagination from "../components/Pagination";
import DetailModal from "../components/DetailModal";
import { fetchJobs, fetchJobMetadata, setJobParams } from "../state/slices/jobsSlice";
import useAnalytics from "../hooks/useAnalytics";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins  = Math.floor(diff / 60000);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return "Today";
};

const EmptyState = ({ message }) => (
  <div className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}>
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const SkeletonJobCard = () => (
  <div className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse flex items-center justify-between gap-4">
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-2/5" />
      <div className="h-3 bg-slate-200 rounded w-1/4" />
      <div className="h-3 bg-slate-200 rounded w-3/5" />
    </div>
    <div className="w-24 h-9 bg-slate-200 rounded-lg shrink-0" />
  </div>
);

const JobCard = ({ job, onClick }) => (
  <div
    className="bg-white rounded-xl border border-slate-100 p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col sm:flex-row sm:items-center gap-3"
    onClick={onClick}
  >
    <div className="flex-1 min-w-0">
      <h3 className="text-[0.95rem] font-bold text-slate-900 m-0 mb-0.5 leading-snug">
        {job.title}
        {job.isVerified && (
          <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1.5 align-middle">
            ✓ Verified
          </span>
        )}
      </h3>
      <p className="text-[0.82rem] text-slate-500 font-medium m-0 mb-2 capitalize">{job.company || job.organization}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {job.jobType && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#2563EB" }}>
            {job.jobType}
          </span>
        )}
        {job.workMode && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#F0FDF4", color: "#16A34A" }}>
            {job.workMode}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        {(job.locationLabel || job.location) && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            {job.locationLabel || job.location}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1">
            <IndianRupee className="w-3 h-3 text-slate-400 shrink-0" />
            {job.salary}
          </span>
        )}
        {(job.postedAt || job.publishedAt) && (
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3 h-3 shrink-0" />
            Posted {timeAgo(job.postedAt || job.publishedAt)}
          </span>
        )}
      </div>
    </div>
    <button
      className="shrink-0 self-start sm:self-center px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      View Details
    </button>
  </div>
);

const SectionHeading = ({ title }) => (
  <h2 className="text-lg font-black text-slate-900 m-0">{title}</h2>
);

const JobsPage = () => {
  const dispatch = useDispatch();
  const { trackCardView } = useAnalytics();

  const {
    jobsList    = [],
    categories  = [],
    locations   = [],
    jobTypes    = [],
    storedParams = {},
    status      = "idle",
    jobsPage    = {},
  } = useSelector((state) => state.jobs || {});

  const isLoading      = status === "loading";
  const activeCategory = storedParams.category || "All";

  const [search, setSearch] = useState(storedParams.search || "");
  const [scope, setScope]   = useState("nellore");
  const [modal, setModal]   = useState(null);

  useEffect(() => {
    dispatch(fetchJobMetadata());
    dispatch(fetchJobs({ ...storedParams, scope }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    const newParams = { page: 1 };
    dispatch(setJobParams(newParams));
    dispatch(fetchJobs({ ...storedParams, ...newParams, scope: newScope }));
  };

  const openJob = (job) => {
    const id = job.id || job._id;
    if (id) trackCardView("jobs", id);
    setModal({
      item: job,
      actionButtons: job.applyLink ? [{ label: "Apply Now", url: job.applyLink }] : [],
    });
  };

  const handleCategoryFilter = (categoryId) => {
    const newParams = { category: categoryId, page: 1 };
    dispatch(setJobParams(newParams));
    dispatch(fetchJobs({ ...storedParams, ...newParams, scope }));
  };

  const handleLocationFilter = (locationId) => {
    const newParams = { location: locationId, page: 1 };
    dispatch(setJobParams(newParams));
    dispatch(fetchJobs({ ...storedParams, ...newParams, scope }));
  };

  const handleJobTypeFilter = (jobType) => {
    const newParams = { jobType, page: 1 };
    dispatch(setJobParams(newParams));
    dispatch(fetchJobs({ ...storedParams, ...newParams, scope }));
  };

  const handleWorkModeFilter = (workMode) => {
    const newParams = { workMode, page: 1 };
    dispatch(setJobParams(newParams));
    dispatch(fetchJobs({ ...storedParams, ...newParams, scope }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { search, page: 1 };
    dispatch(setJobParams(newParams));
    dispatch(fetchJobs({ ...storedParams, ...newParams, scope }));
  };

  const onPageChange = (page) => {
    const newParams = { page };
    dispatch(setJobParams(newParams));
    dispatch(fetchJobs({ ...storedParams, ...newParams, scope }));
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  // Group 3 most-recent per category for "All" view
  const jobsByCategory = useMemo(() => {
    if (activeCategory !== "All") return null;
    const map = new Map();
    for (const job of jobsList) {
      const catId = job.categoryId || job.category || "__none__";
      const arr = map.get(catId) || [];
      if (arr.length < 3) map.set(catId, [...arr, job]);
    }
    return map;
  }, [jobsList, activeCategory]);

  const getCategoryLabel = (catId) => {
    if (catId === "__none__") return "Other";
    return categories.find((c) => (c.id || c._id) === catId)?.label || catId;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      <TopHeader />
      <MainHeader />
      <Navbar />

      <main className="flex-1 overflow-x-hidden pt-8 pb-16">
        <div className="px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Main column ──────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Heading + scope */}
              <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-1">Job Opportunities</h1>
                  <p className="text-sm text-slate-500 m-0">
                    Finding your future in{" "}
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
                      style={scope === s
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
                  <label htmlFor="jobs-search" className="sr-only">Search jobs</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="jobs-search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search jobs, companies..."
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

              {/* Filter row */}
              <div className="mb-8 flex flex-wrap items-center gap-3">
                {(isLoading || categories.length > 0) && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
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

                {locations.length > 0 && (
                  <div className="relative shrink-0">
                    <label htmlFor="jobs-location" className="sr-only">Filter by location</label>
                    <select
                      id="jobs-location"
                      name="location"
                      autoComplete="off"
                      value={storedParams.location || "All"}
                      onChange={(e) => handleLocationFilter(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 rounded-full px-4 py-1.5 pr-8 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="All">Location</option>
                      {locations.map((loc) => (
                        <option key={loc.id || loc._id} value={loc.id || loc._id}>
                          {loc.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▾</span>
                  </div>
                )}

                {jobTypes.length > 0 && (
                  <div className="relative shrink-0">
                    <label htmlFor="jobs-type" className="sr-only">Filter by job type</label>
                    <select
                      id="jobs-type"
                      name="jobType"
                      autoComplete="off"
                      value={storedParams.jobType || "All"}
                      onChange={(e) => handleJobTypeFilter(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 rounded-full px-4 py-1.5 pr-8 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="All">Job Type</option>
                      {jobTypes.map((t) => (
                        <option key={t.id || t._id} value={t.label}>{t.label}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▾</span>
                  </div>
                )}

                <div className="relative shrink-0">
                  <label htmlFor="jobs-workmode" className="sr-only">Filter by work mode</label>
                  <select
                    id="jobs-workmode"
                    name="workMode"
                    autoComplete="off"
                    value={storedParams.workMode || "All"}
                    onChange={(e) => handleWorkModeFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-full px-4 py-1.5 pr-8 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="All">Work Mode</option>
                    {["Remote", "On-site", "Hybrid", "Part-time", "Contract"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▾</span>
                </div>
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map((i) => <SkeletonJobCard key={i} />)}
                </div>
              ) : activeCategory === "All" ? (
                !jobsByCategory || jobsByCategory.size === 0 ? (
                  <EmptyState message="No jobs found." />
                ) : (
                  <div className="flex flex-col gap-10">
                    {Array.from(jobsByCategory.entries()).map(([catId, jobs]) => (
                      <section key={catId}>
                        <div className="flex items-center gap-3 mb-4">
                          <SectionHeading title={getCategoryLabel(catId)} />
                        </div>
                        <div className="flex flex-col gap-3">
                          {jobs.map((job) => (
                            <JobCard
                              key={job.id || job._id}
                              job={job}
                              onClick={() => openJob(job)}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )
              ) : (
                jobsList.length === 0 ? (
                  <EmptyState message="No jobs found in this category." />
                ) : (
                  <>
                    <div className="flex flex-col gap-3">
                      {jobsList.map((job) => (
                        <JobCard
                          key={job.id || job._id}
                          job={job}
                          onClick={() => openJob(job)}
                        />
                      ))}
                    </div>
                    {jobsPage.totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination
                          currentPage={jobsPage.currentPage}
                          totalPages={jobsPage.totalPages}
                          onPageChange={onPageChange}
                        />
                      </div>
                    )}
                  </>
                )
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

export default JobsPage;
