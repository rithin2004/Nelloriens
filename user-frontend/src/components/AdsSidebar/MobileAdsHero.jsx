import React, { useState, useEffect, useRef } from 'react';
import useAdTracking from '../../hooks/useAdTracking';

const HeroCard = ({ ad }) => {
  const { elementRef, handleAdClick } = useAdTracking(ad.id, 'google');

  return (
    <a
      ref={elementRef}
      href={ad.link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleAdClick}
      className="w-full shrink-0 block no-underline relative overflow-hidden rounded-2xl"
      style={{ color: 'inherit' }}
    >
      {ad.image ? (
        <img src={ad.image} alt={ad.title} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-gray-200" />
      )}
      <div
        className="absolute inset-0 flex flex-col justify-end p-4"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }}
      >
        <p className="text-white text-sm font-semibold m-0 leading-snug">{ad.title}</p>
        {ad.tagline && (
          <p className="text-white/80 text-xs m-0 mt-0.5 truncate">{ad.tagline}</p>
        )}
      </div>
    </a>
  );
};

const MobileAdsHero = ({ ads }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (ads.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [ads.length]);

  if (!ads || ads.length === 0) return null;

  return (
    <div className="w-full lg:hidden px-4 pt-4 pb-2">
      <p className="text-[0.68rem] font-bold uppercase tracking-widest text-gray-400 m-0 mb-2">Recommended</p>
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {ads.map((ad) => (
            <HeroCard key={ad.id} ad={ad} />
          ))}
        </div>
        {ads.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setCurrent(i); }}
                className="rounded-full border-0 p-0 transition-all duration-200 cursor-pointer"
                style={{
                  width: i === current ? 16 : 6,
                  height: 6,
                  background: i === current ? '#ffffff' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAdsHero;
