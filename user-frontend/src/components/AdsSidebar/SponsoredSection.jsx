import React from 'react';
import useAdTracking from '../../hooks/useAdTracking';

const SponsorCard = ({ sponsorship }) => {
  const { elementRef, handleAdClick } = useAdTracking(sponsorship.id, 'partner');

  return (
    <a
      ref={elementRef}
      href={sponsorship.link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleAdClick}
      className="flex flex-col items-center gap-1.5 px-3 shrink-0 no-underline group"
      style={{ color: 'inherit' }}
    >
      <div className="w-11 h-11 rounded-full overflow-hidden bg-white/80 border border-white/50 shadow flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
        {sponsorship.image ? (
          <img src={sponsorship.image} alt={sponsorship.title} className="w-full h-full object-contain p-1" />
        ) : (
          <span className="text-[0.6rem] font-bold text-gray-500 text-center px-1 leading-tight">
            {sponsorship.title?.slice(0, 4)}
          </span>
        )}
      </div>
      <span className="text-[0.63rem] font-semibold text-gray-600 whitespace-nowrap max-w-14 truncate text-center">
        {sponsorship.title}
      </span>
    </a>
  );
};

const SponsoredSection = ({ sponsorships, animate = false, inline = false }) => {
  if (!sponsorships || sponsorships.length === 0) return null;

  return (
    <div className={inline ? 'w-full' : 'flex flex-col gap-2'}>
      {!inline && (
        <p className="text-[0.68rem] font-bold uppercase tracking-widest text-gray-400 m-0 px-1">Sponsored</p>
      )}
      <div className="overflow-hidden">
        <div
          className={animate ? 'ticker-hover-pause flex py-1' : 'flex flex-wrap gap-3 justify-center py-1'}
          style={animate ? { animation: 'tickerSlide 20s linear infinite' } : undefined}
        >
          {sponsorships.map((s) => (
            <SponsorCard key={s.id} sponsorship={s} />
          ))}
          {animate && sponsorships.map((s) => (
            <SponsorCard key={`dup-${s.id}`} sponsorship={s} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsoredSection;
