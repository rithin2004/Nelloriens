import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchNews } from '../../state/slices/newsSlice';
import { fetchJobs } from '../../state/slices/jobsSlice';
import { fetchEvents } from '../../state/slices/eventsSlice';
import { fetchFamousFoods } from '../../state/slices/famousFoodsSlice';
import SidebarContent from './SidebarContent';
import AdvertiseBanner from '../AdvertiseBanner/AdvertiseBanner';
import DetailModal from '../DetailModal';
import useAnalytics from '../../hooks/useAnalytics';
// ── Skeleton components ───────────────────────────────────────────────────
const SkeletonLuxCard = () => (
  <div className="rounded-xl overflow-hidden animate-pulse" style={{ background: '#F1F5F9' }}>
    <div style={{ height: 200, background: '#E2E8F0' }} />
    <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ height: 10, background: '#E2E8F0', borderRadius: 4, width: '40%' }} />
      <div style={{ height: 14, background: '#E2E8F0', borderRadius: 4, width: '100%' }} />
      <div style={{ height: 14, background: '#E2E8F0', borderRadius: 4, width: '70%' }} />
    </div>
  </div>
);

const SkeletonJobRow = () => (
  <div className="lux-card flex items-center justify-between p-4 flex-wrap gap-6 animate-pulse">
    <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ height: 14, background: '#E2E8F0', borderRadius: 4, width: '60%' }} />
      <div style={{ height: 11, background: '#E2E8F0', borderRadius: 4, width: '40%' }} />
    </div>
    <div style={{ height: 11, background: '#E2E8F0', borderRadius: 4, width: 80 }} />
  </div>
);

const SkeletonFoodMain = () => (
  <div className="animate-pulse" style={{ borderRadius: 12, overflow: 'hidden', background: '#E2E8F0', height: '100%', minHeight: 260 }} />
);

const SkeletonFoodSide = () => (
  <div className="animate-pulse" style={{ borderRadius: 12, overflow: 'hidden', background: '#E2E8F0', height: 120 }} />
);

const SectionHeading = ({ eyebrow, title, className = '' }) => (
  <div className={className}>
    {eyebrow && (
      <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A34E', display: 'block', marginBottom: '10px' }}>
        {eyebrow}
      </span>
    )}
    <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '12px' }}>
      {title}
    </h2>
    <div style={{ width: '40px', height: '2px', background: '#C9A34E' }} />
  </div>
);

// onClick takes priority over Link navigation
const LuxCard = ({ image, eyebrow, title, meta, to, onClick }) => {
  const inner = (
    <>
      <div className="img-zoom" style={{ height: '200px', position: 'relative' }}>
        <div className="img-inner" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.4) 0%, transparent 60%)' }} />
        {eyebrow && (
          <span style={{ position: 'absolute', top: '14px', left: '14px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0F172A', background: '#C9A34E', padding: '4px 10px', borderRadius: '2px' }}>
            {eyebrow}
          </span>
        )}
      </div>
      <div style={{ padding: '20px 22px 22px' }}>
        {meta && <p style={{ fontSize: '11px', color: '#94A3B8', letterSpacing: '0.06em', marginBottom: '8px' }}>{meta}</p>}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.4, marginBottom: 0 }}>{title}</h3>
      </div>
    </>
  );
  if (onClick) {
    return (
      <div className="lux-card" style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }} onClick={onClick}>
        {inner}
      </div>
    );
  }
  return (
    <Link to={to} className="lux-card" style={{ display: 'block', borderRadius: '12px', overflow: 'hidden', textDecoration: 'none' }}>
      {inner}
    </Link>
  );
};

const EmptyState = ({ message }) => (
  <div className="w-full flex items-center justify-center py-10 rounded-2xl" style={{ background: 'rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.07)' }}>
    <p style={{ fontSize: '0.9rem', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>{message}</p>
  </div>
);

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const MainContentArea = () => {
  const dispatch = useDispatch();
  const { trackCardView } = useAnalytics();
  const [modal, setModal] = useState(null); // { item, actionButtons }

  const openCard = (module, item, actionButtons) => {
    const id = item.id || item._id;
    if (id) trackCardView(module, id);
    setModal({ item, actionButtons });
  };
  const closeModal = () => setModal(null);

  const newsFeedArticles = useSelector((state) => state.news?.newsFeedArticles || []);
  const jobsList         = useSelector((state) => state.jobs?.jobsList || []);
  const latestEvents     = useSelector((state) => state.events?.latestEvents || []);
  const signatureDishes  = useSelector((state) => state.famousFoods?.signatureDishes || []);

  const newsLoading  = useSelector((state) => state.news?.status === "loading");
  const jobsLoading  = useSelector((state) => state.jobs?.status === "loading");
  const eventsLoading = useSelector((state) => state.events?.status === "loading");
  const foodsLoading = useSelector((state) => state.famousFoods?.status === "loading");

  const onePerCategory = (items, cap = 6) => {
    const seen = new Set();
    const result = [];
    for (const item of items) {
      const cat = item.categoryId || item.categoryName || item.category || '__none__';
      if (seen.has(cat)) continue;
      seen.add(cat);
      result.push(item);
      if (result.length >= cap) break;
    }
    return result;
  };

  const featuredNews   = useMemo(() => onePerCategory(newsFeedArticles), [newsFeedArticles]);
  const featuredJobs   = useMemo(() => onePerCategory(jobsList),         [jobsList]);
  const featuredEvents = useMemo(() => onePerCategory(latestEvents),     [latestEvents]);

  useEffect(() => {
    dispatch(fetchNews({ limit: 20 }));
    dispatch(fetchJobs({ limit: 20 }));
    dispatch(fetchEvents({ limit: 20 }));
    dispatch(fetchFamousFoods({ limit: 3 }));
  }, [dispatch]);

  return (
    <>
    <div className="py-8 min-h-100 w-full px-4 lg:px-10" style={{ background: '#F8FAFC' }}>
        <div className="flex flex-col lg:flex-row gap-8">

          <div className="flex-1 min-w-0">
            
            {/* FEATURED NEWS */}
            <section className="luxury-section" style={{ paddingTop: 0, paddingBottom: '32px' }}>
              <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
                <SectionHeading eyebrow="Latest" title="Featured News" />
                {featuredNews.length > 0 && (
                  <Link to="/news" className="view-all-link">View All <ArrowRight size={14} /></Link>
                )}
              </div>
              {newsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1,2,3].map(i => <SkeletonLuxCard key={i} />)}
                </div>
              ) : featuredNews.length === 0 ? (
                <EmptyState message="No news found." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {featuredNews.map((news, idx) => (
                    <LuxCard
                      key={news.id || news._id || idx}
                      image={news.thumbnail || news.image || news.imageUrl}
                      eyebrow={news.categoryName || news.category}
                      title={news.title}
                      meta={timeAgo(news.createdAt)}
                      onClick={() => openCard('news', news, [
                        { label: 'Read Full Article', to: `/news/${news.id || news._id}` },
                      ])}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* LATEST JOBS */}
            <section className="luxury-section border-t" style={{ paddingTop: '32px' }}>
              <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
                <SectionHeading eyebrow="Opportunities" title="Latest Jobs" />
                {featuredJobs.length > 0 && (
                  <Link to="/jobs" className="view-all-link">View All <ArrowRight size={14} /></Link>
                )}
              </div>
              {jobsLoading ? (
                <div className="flex flex-col gap-4">
                  {[1,2,3].map(i => <SkeletonJobRow key={i} />)}
                </div>
              ) : featuredJobs.length === 0 ? (
                <EmptyState message="No jobs found." />
              ) : (
                <div className="flex flex-col gap-4">
                  {featuredJobs.map((job, idx) => (
                    <div
                      key={job.id || job._id || idx}
                      className="lux-card flex items-center justify-between p-4 flex-wrap gap-6"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openCard('jobs', job, [
                        ...(job.applyLink ? [{ label: 'Apply Now', url: job.applyLink }] : []),
                        { label: 'View All Jobs', to: '/jobs', variant: 'outline' },
                      ])}
                    >
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="job-title-home">{job.title}</h3>
                          {job.type && <span className={`job-type-badge ${job.type === 'Government' ? 'gov' : 'pvt'}`}>{job.type}</span>}
                        </div>
                        <p className="job-meta-home capitalize">{[job.company, job.location].filter(Boolean).join(' · ')}</p>
                      </div>
                      <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                        <span className="job-salary-home">{job.salary || 'Competitive'}</span>
                        <Link to="/jobs" className="btn-gold px-4 py-2 text-xs">Apply</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="py-2 px-3">
              <AdvertiseBanner />
            </div>

            {/* FEATURED EVENTS */}
            <section className="luxury-section border-t" style={{ paddingTop: '32px' }}>
              <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
                <SectionHeading eyebrow="Upcoming" title="Featured Events" />
                {featuredEvents.length > 0 && (
                  <Link to="/events" className="view-all-link">Explore All <ArrowRight size={14} /></Link>
                )}
              </div>
              {eventsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1,2,3].map(i => <SkeletonLuxCard key={i} />)}
                </div>
              ) : featuredEvents.length === 0 ? (
                <EmptyState message="No events found." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {featuredEvents.map((event, idx) => (
                    <LuxCard
                      key={event.id || event._id || idx}
                      image={event.thumbnail || event.image || event.imageUrl}
                      eyebrow={event.categoryName || event.category}
                      title={event.title}
                      meta={timeAgo(event.createdAt)}
                      onClick={() => openCard('events', event, [
                        ...(event.bookingUrl ? [{ label: 'Book Now', url: event.bookingUrl }] : []),
                        ...(event.trailerUrl ? [{ label: 'Watch Trailer', url: event.trailerUrl }] : []),
                        { label: 'Explore All Events', to: '/events', variant: 'outline' },
                      ])}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* FLAVOURS OF NELLORE */}
            <section className="luxury-section border-t">
              <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
                <SectionHeading eyebrow="Cuisine" title="The Flavours of Nellore" />
                {signatureDishes.length > 0 && (
                  <Link to="/famous-foods" className="view-all-link">Explore More <ArrowRight size={14} /></Link>
                )}
              </div>
              {foodsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SkeletonFoodMain />
                  <div className="flex flex-col gap-4">
                    <SkeletonFoodSide />
                    <SkeletonFoodSide />
                  </div>
                </div>
              ) : signatureDishes.length === 0 ? (
                <EmptyState message="No cuisine items found." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="img-zoom food-main-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => openCard('foods', signatureDishes[0], [
                      { label: 'Explore Famous Foods', to: '/famous-foods', variant: 'outline' },
                    ])}
                  >
                    <div className="img-inner" style={{ backgroundImage: `url(${signatureDishes[0].image || signatureDishes[0].imageUrl})` }} />
                    <div className="food-card-overlay" />
                    <div className="food-card-content">
                      <p className="food-note">{signatureDishes[0].categoryLabel || signatureDishes[0].note || 'Local Special'}</p>
                      <h3 className="food-name">{signatureDishes[0].foodName || signatureDishes[0].name}</h3>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {signatureDishes.slice(1, 3).map((food, idx) => (
                      <div
                        key={food.id || food._id || idx}
                        className="img-zoom food-side-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => openCard('foods', food, [
                          { label: 'Explore Famous Foods', to: '/famous-foods', variant: 'outline' },
                        ])}
                      >
                        <div className="img-inner" style={{ backgroundImage: `url(${food.image || food.imageUrl})` }} />
                        <div className="food-card-overlay" />
                        <div className="food-card-content-sm">
                          <p className="food-note-sm">{food.categoryLabel || food.note || 'Authentic'}</p>
                          <h3 className="food-name-sm">{food.foodName || food.name}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>

          <SidebarContent includeAds={true} showWeather={true} />
        </div>
    </div>

    {modal && (
      <DetailModal
        item={modal.item}
        onClose={closeModal}
        actionButtons={modal.actionButtons}
      />
    )}
    </>
  );
};

export default MainContentArea;
