import React from 'react';
import { Bookmark } from 'lucide-react';

const EventCard = ({ event, onClick }) => {
  return (
    <div 
      onClick={() => onClick(event)}
      className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col overflow-hidden h-full"
    >
      {/* Image Section - Edge to Edge Top */}
      <div className="relative h-48 w-full overflow-hidden shrink-0">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-[17px] font-extrabold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-slate-500 text-[13px] font-medium mb-6 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Footer Section - Minimal space between */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-100">
              <img src={event.authorImage} alt={event.authorName} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-900 leading-none mb-1 capitalize">{event.authorName || ""}</span>
              <span className="text-[11px] font-medium text-slate-400">
                {event.date}
              </span>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-900 transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

