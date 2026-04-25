import React from 'react';

const CarouselSlide = ({ item }) => {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-4xl overflow-hidden">
      <img 
        src={item.image} 
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {/* Light edge-to-edge frosted overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 bg-white/70 backdrop-blur-md p-8 md:p-12 pt-10 border-t border-white/50">
        <div className="max-w-3xl pr-20">
          <h2 className="text-slate-900 text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
            {item.title}
          </h2>
          <p className="text-slate-700 text-sm md:text-base line-clamp-2 md:line-clamp-3 font-medium leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarouselSlide;
