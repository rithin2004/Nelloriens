import React, { useRef } from 'react';
import useAdTracking from '../../hooks/useAdTracking';

const SocialItem = ({ post }) => {
  const { elementRef, handleAdClick } = useAdTracking(post.id, 'social');
  const videoRef = useRef(null);
  const isVideo = post.type === 'VIDEO' || !!post.videoUrl;

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      ref={elementRef}
      className="relative overflow-hidden rounded-xl cursor-pointer bg-gray-100 aspect-square"
      onClick={() => {
        handleAdClick();
        if (post.link) window.open(post.link, '_blank');
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            src={post.videoUrl}
            poster={post.image}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 hover:opacity-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
          </div>
        </>
      ) : (
        <img
          src={post.image}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
    </div>
  );
};

const SocialFeed = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.68rem] font-bold uppercase tracking-widest text-gray-400 m-0 px-1">From Our Community</p>
      <div className="grid grid-cols-3 gap-1.5">
        {posts.slice(0, 6).map((post) => (
          <SocialItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default SocialFeed;
