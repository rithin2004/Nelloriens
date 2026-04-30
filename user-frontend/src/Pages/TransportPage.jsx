import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Train, Bus, Plane, Car } from 'lucide-react';
import { fetchTransports, setTransportParams } from '../state/slices/transportSlice';
import DetailModal from '../components/DetailModal';
import SidebarContent from '../components/ContentSections/SidebarContent';
import TopHeader from '../components/TopHeader';
import MainHeader from '../components/MainHeader';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import useAnalytics from "../hooks/useAnalytics";

const SECTION_DEFAULT = 4;

const EmptyState = ({ message }) => (
  <div className="w-full flex items-center justify-center py-10 rounded-2xl"
    style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)" }}>
    <p style={{ fontSize: "0.9rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>{message}</p>
  </div>
);

const SectionHeading = ({ label, title, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-red-500 rounded-sm shrink-0" />
        <h2 className="text-xl font-black text-slate-900 m-0">{title}</h2>
      </div>
    </div>
    {action}
  </div>
);

const ViewAllBtn = ({ total, onClick }) => (
  <button
    onClick={onClick}
    className="text-sm font-bold text-blue-600 hover:underline whitespace-nowrap self-end mb-0.5"
  >
    View All {total} →
  </button>
);

const ShowLessBtn = ({ onClick }) => (
  <button onClick={onClick} className="text-sm font-bold text-slate-400 hover:text-slate-600 hover:underline whitespace-nowrap self-end mb-0.5">
    Show Less
  </button>
);

// Parse "6:30 AM" / "14:30" to minutes since midnight
const toMinutes = (timeStr) => {
  if (!timeStr) return 9999;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 9999;
  let [, h, m, ampm] = match;
  h = parseInt(h); m = parseInt(m);
  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
  }
  return h * 60 + m;
};

// Sort: upcoming first (nearest departure), then already-departed (most recently past first)
const sortByDeparture = (items) => {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return [...items].sort((a, b) => {
    const aM = toMinutes(a.departureTime);
    const bM = toMinutes(b.departureTime);
    const aUp = aM >= nowMins;
    const bUp = bM >= nowMins;
    if (aUp && !bUp) return -1;
    if (!aUp && bUp) return 1;
    if (aUp && bUp) return aM - bM;
    return bM - aM;
  });
};

const SkeletonTrainRow = () => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 animate-pulse">
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-2/5" />
      <div className="h-3 bg-slate-200 rounded w-3/5" />
    </div>
    <div className="w-20 h-9 bg-slate-200 rounded-xl shrink-0" />
  </div>
);

const SkeletonBusCard = () => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 animate-pulse flex flex-col gap-3">
    <div className="h-4 bg-slate-200 rounded w-2/3" />
    <div className="h-3 bg-slate-200 rounded w-1/2" />
    <div className="h-3 bg-slate-200 rounded w-1/3" />
    <div className="h-8 bg-slate-200 rounded-xl mt-2" />
  </div>
);

const SkeletonAirportRow = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex animate-pulse">
    <div className="w-40 h-28 bg-slate-200 shrink-0" />
    <div className="p-5 flex-1 flex flex-col gap-2">
      <div className="h-4 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-1/3" />
      <div className="h-3 bg-slate-200 rounded w-1/4 mt-2" />
    </div>
  </div>
);

const SkeletonLocalCard = () => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 animate-pulse flex flex-col gap-2 items-center text-center">
    <div className="w-10 h-10 bg-slate-200 rounded-full" />
    <div className="h-4 bg-slate-200 rounded w-3/4" />
    <div className="h-3 bg-slate-200 rounded w-full" />
  </div>
);

const TransportationPage = () => {
  const dispatch = useDispatch();
  const { trackCardView, trackPageView } = useAnalytics();

  const { transports, storedParams, status, transportPage } = useSelector((state) => state.transport);
  const isLoading = status === "loading";

  const [search, setSearch] = useState(storedParams.search || "");
  const [scope, setScope] = useState("nellore");
  const [modal, setModal] = useState(null);
  const [showAllTrains, setShowAllTrains] = useState(false);
  const [showAllBuses, setShowAllBuses] = useState(false);
  const [showAllAirports, setShowAllAirports] = useState(false);
  const [showAllLocal, setShowAllLocal] = useState(false);

  useEffect(() => {
    dispatch(fetchTransports({ ...storedParams, scope }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    setShowAllTrains(false);
    setShowAllBuses(false);
    setShowAllAirports(false);
    setShowAllLocal(false);
    const newParams = { page: 1 };
    dispatch(setTransportParams(newParams));
    dispatch(fetchTransports({ ...storedParams, ...newParams, scope: newScope }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { search, page: 1 };
    dispatch(setTransportParams(newParams));
    dispatch(fetchTransports({ ...storedParams, ...newParams, scope }));
  };

  const handlePageChange = (page) => {
    const newParams = { page };
    dispatch(setTransportParams(newParams));
    dispatch(fetchTransports({ ...storedParams, ...newParams, scope }));
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const categorized = useMemo(() => {
    const cat = (x) => (x.category || x.type || "").toLowerCase();
    return {
      trains:   sortByDeparture(transports.filter((x) => cat(x).includes("train") || cat(x).includes("express") || cat(x).includes("superfast") || cat(x).includes("passenger") || cat(x) === "rail")),
      buses:    sortByDeparture(transports.filter((x) => cat(x).includes("bus") || cat(x).includes("volvo") || cat(x).includes("deluxe") || cat(x).includes("ac") || cat(x) === "road")),
      airports: transports.filter((x) => cat(x).includes("airport") || cat(x).includes("air")),
      local:    transports.filter((x) => cat(x).includes("local") || cat(x).includes("auto") || cat(x).includes("bike") || cat(x).includes("rental") || cat(x).includes("cab") || cat(x).includes("city bus")),
    };
  }, [transports]);

  const openModal = (item) => {
    const id = item.id || item._id;
    if (id) { trackCardView("transport", id); trackPageView("transport", id); }
    setModal({
      item,
      actionButtons: item.bookingUrl ? [{ label: "Book Now", url: item.bookingUrl }] : [],
    });
  };

  const trainList   = showAllTrains   ? categorized.trains   : categorized.trains.slice(0, SECTION_DEFAULT);
  const busList     = showAllBuses    ? categorized.buses     : categorized.buses.slice(0, SECTION_DEFAULT);
  const airportList = showAllAirports ? categorized.airports  : categorized.airports.slice(0, SECTION_DEFAULT);
  const localList   = showAllLocal    ? categorized.local     : categorized.local.slice(0, SECTION_DEFAULT);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      <TopHeader />
      <MainHeader />
      <Navbar />

      {/* Hero */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: "220px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)",
        }}
      >
        <div className="relative text-center px-6 z-10">
          <p className="text-blue-300 text-[11px] font-bold uppercase tracking-widest mb-3">Travel &amp; Connections</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            {scope === "nellore" ? "Navigate Nellore" : "Navigate Worldwide"}
          </h1>
          <p className="text-white/60 text-sm font-medium">
            Comprehensive guide to reaching and moving around{" "}
            <span className="text-blue-300 font-bold">{scope === "nellore" ? "Nellore" : "Worldwide"}</span>.
          </p>
        </div>
      </div>

      <main className="flex-1 overflow-x-hidden pt-8 pb-16">
        <div className="px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Main column */}
            <div className="flex-1 min-w-0 flex flex-col gap-12">

              {/* Heading + scope */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-1">Transport &amp; Travel</h1>
                  <p className="text-sm text-slate-500 m-0">
                    Connections in{" "}
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
              <form onSubmit={handleSearch} className="flex gap-2" role="search">
                <div className="relative flex-1">
                  <label htmlFor="transport-search" className="sr-only">Search transport</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="transport-search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search trains, buses, routes..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </form>

              {/* TRAINS */}
              <section>
                <SectionHeading
                  label="By Rail"
                  title="Train Connections"
                  action={
                    !showAllTrains && categorized.trains.length > SECTION_DEFAULT ? (
                      <ViewAllBtn total={categorized.trains.length} onClick={() => setShowAllTrains(true)} />
                    ) : showAllTrains ? (
                      <ShowLessBtn onClick={() => setShowAllTrains(false)} />
                    ) : null
                  }
                />
                {isLoading && categorized.trains.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    {[1,2,3,4].map((i) => <SkeletonTrainRow key={i} />)}
                  </div>
                ) : trainList.length === 0 ? (
                  <EmptyState message="No train connections found." />
                ) : (
                  <div className="flex flex-col gap-3">
                    {trainList.map((train) => (
                      <div
                        key={train.id || train._id}
                        className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-4 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => openModal(train)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <h3 className="font-bold text-[0.95rem] text-slate-800">{train.name}</h3>
                            {train.number && <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">{train.number}</span>}
                            {train.type && <span className="bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold text-blue-600 uppercase">{train.type}</span>}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                            {(train.from || train.to) && <span>{train.from} → {train.to}</span>}
                            {train.departureTime && <span>{train.departureTime}{train.arrivalTime ? ` – ${train.arrivalTime}` : ""}</span>}
                            {(train.totalDuration || train.duration) && <span className="font-bold text-blue-600">{train.totalDuration || train.duration}</span>}
                          </div>
                          {Array.isArray(train.fareDetails) && train.fareDetails.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {train.fareDetails.map((f, i) => (
                                <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "#F1F5F9", color: "#475569" }}>
                                  {f.class || f.type}: ₹{f.fare || f.price}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          className="shrink-0 bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
                          onClick={(e) => { e.stopPropagation(); if (train.bookingUrl) window.open(train.bookingUrl, '_blank'); else openModal(train); }}
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* BUSES */}
              <section>
                <SectionHeading
                  label="By Road"
                  title="Bus Services"
                  action={
                    !showAllBuses && categorized.buses.length > SECTION_DEFAULT ? (
                      <ViewAllBtn total={categorized.buses.length} onClick={() => setShowAllBuses(true)} />
                    ) : showAllBuses ? (
                      <ShowLessBtn onClick={() => setShowAllBuses(false)} />
                    ) : null
                  }
                />
                {isLoading && categorized.buses.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1,2,3,4].map((i) => <SkeletonBusCard key={i} />)}
                  </div>
                ) : busList.length === 0 ? (
                  <EmptyState message="No bus services found." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {busList.map((bus) => (
                      <div
                        key={bus.id || bus._id}
                        className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all cursor-pointer flex flex-col"
                        onClick={() => openModal(bus)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-slate-800 text-sm">{bus.from ? `${bus.from} → ${bus.to}` : bus.name}</h3>
                          {bus.type && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ml-2">{bus.type}</span>}
                        </div>
                        <div className="space-y-1.5 mb-4 flex-1">
                          {bus.name && <div className="flex justify-between text-xs text-slate-500"><span>Operator</span><span className="font-bold text-slate-700 capitalize">{bus.name}</span></div>}
                          {bus.departureTime && <div className="flex justify-between text-xs text-slate-500"><span>Departs</span><span className="font-bold text-slate-700">{bus.departureTime}</span></div>}
                          {(bus.totalDuration || bus.duration) && <div className="flex justify-between text-xs text-slate-500"><span>Duration</span><span className="font-bold text-slate-700">{bus.totalDuration || bus.duration}</span></div>}
                          {bus.frequency && <div className="flex justify-between text-xs text-slate-500"><span>Frequency</span><span className="font-bold text-slate-700">{bus.frequency}</span></div>}
                          {Array.isArray(bus.fareDetails) && bus.fareDetails.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {bus.fareDetails.map((f, i) => (
                                <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "#F1F5F9", color: "#475569" }}>
                                  {f.class || f.type}: ₹{f.fare || f.price}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                          <span className="text-base font-black text-emerald-600">{bus.price ? `₹${bus.price}` : ""}</span>
                          <button
                            className="text-xs font-bold text-blue-600 hover:underline"
                            onClick={(e) => { e.stopPropagation(); if (bus.bookingUrl) window.open(bus.bookingUrl, '_blank'); else openModal(bus); }}
                          >
                            Book Online
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* AIRPORTS */}
              <section>
                <SectionHeading
                  label="By Air"
                  title="Nearby Airports"
                  action={
                    !showAllAirports && categorized.airports.length > SECTION_DEFAULT ? (
                      <ViewAllBtn total={categorized.airports.length} onClick={() => setShowAllAirports(true)} />
                    ) : showAllAirports ? (
                      <ShowLessBtn onClick={() => setShowAllAirports(false)} />
                    ) : null
                  }
                />
                {isLoading && categorized.airports.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    {[1,2,3].map((i) => <SkeletonAirportRow key={i} />)}
                  </div>
                ) : airportList.length === 0 ? (
                  <EmptyState message="No nearby airports listed yet." />
                ) : (
                  <div className="flex flex-col gap-3">
                    {airportList.map((airport) => (
                      <div
                        key={airport.id || airport._id}
                        className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-all cursor-pointer"
                        onClick={() => openModal(airport)}
                      >
                        {airport.image ? (
                          <img src={airport.image} alt={airport.name} className="w-full sm:w-40 h-32 sm:h-auto object-cover shrink-0" />
                        ) : (
                          <div className="w-full sm:w-40 h-32 sm:h-auto bg-slate-200 shrink-0 flex items-center justify-center">
                            <Plane className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        <div className="p-5 flex-1">
                          <h3 className="font-bold text-slate-800 text-base mb-0.5">{airport.name}</h3>
                          {airport.type && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{airport.type}</p>}
                          <div className="flex gap-8 flex-wrap">
                            {(airport.distance || airport.distanceKm) && (
                              <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Distance</div>
                                <div className="font-black text-indigo-600">{airport.distance || `${airport.distanceKm} km`}</div>
                              </div>
                            )}
                            {(airport.time || airport.travelTime) && (
                              <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">By Road</div>
                                <div className="font-black text-slate-800">{airport.time || airport.travelTime}</div>
                              </div>
                            )}
                            {airport.baseFare && (
                              <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">From</div>
                                <div className="font-black text-emerald-600">₹{airport.baseFare}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* LOCAL TRANSPORT */}
              <section>
                <SectionHeading
                  label="City Connections"
                  title="Local Transport"
                  action={
                    !showAllLocal && categorized.local.length > SECTION_DEFAULT ? (
                      <ViewAllBtn total={categorized.local.length} onClick={() => setShowAllLocal(true)} />
                    ) : showAllLocal ? (
                      <ShowLessBtn onClick={() => setShowAllLocal(false)} />
                    ) : null
                  }
                />
                {isLoading && categorized.local.length === 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[1,2,3,4].map((i) => <SkeletonLocalCard key={i} />)}
                  </div>
                ) : localList.length === 0 ? (
                  <EmptyState message="No local transport listed yet." />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {localList.map((item) => (
                      <div
                        key={item.id || item._id}
                        className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col items-center text-center gap-2 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => openModal(item)}
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm leading-snug">{item.name}</h3>
                        {(item.type || item.coverage || item.baseFare) && (
                          <p className="text-[11px] text-slate-400 m-0">
                            {[item.type, item.coverage || item.coverageArea, item.baseFare && `From ₹${item.baseFare}`].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Pagination (when any section is in "View All" mode and server has more pages) */}
              {(showAllTrains || showAllBuses || showAllAirports || showAllLocal) && transportPage.totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={transportPage.currentPage}
                    totalPages={transportPage.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {/* Traveller's Note */}
              <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" }}
              >
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-200 mb-3">Traveller's Note</h4>
                <ul className="space-y-2 text-sm text-blue-100 font-medium">
                  <li className="flex gap-2"><span>·</span> Timings are subject to change. Please verify with official portals.</li>
                  <li className="flex gap-2"><span>·</span> Railway bookings can be made at the official rail booking portal.</li>
                  <li className="flex gap-2"><span>·</span> Bus tickets are available on the official APSRTC online portal.</li>
                  <li className="flex gap-2"><span>·</span> Local taxis and autos are best found at major hubs and via apps.</li>
                </ul>
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
          actionButtons={modal.actionButtons}
        />
      )}
    </div>
  );
};

export default TransportationPage;
