import React from 'react';
import useAdTracking from '../../hooks/useAdTracking';

const AdCard = ({ ad }) => {
  const { elementRef, handleAdClick } = useAdTracking(ad.id, 'google');

  return (
    <a
      ref={elementRef}
      href={ad.link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleAdClick}
      className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 no-underline hover:bg-black/5"
      style={{ color: 'inherit' }}
    >
      {ad.image && (
        <div className="w-13 h-13 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[0.82rem] font-semibold text-gray-800 m-0 leading-snug line-clamp-2">{ad.title}</p>
        {ad.tagline && (
          <p className="text-[0.73rem] text-gray-500 m-0 mt-0.5 truncate">{ad.tagline}</p>
        )}
      </div>
    </a>
  );
};

const RecommendedSection = ({ ads, hideTitle = false }) => {
  if (!ads || ads.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5">
      {!hideTitle && (
        <p className="text-[0.68rem] font-bold uppercase tracking-widest text-gray-400 m-0 mb-1 px-1">Recommended</p>
      )}
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
};

export default RecommendedSection;
