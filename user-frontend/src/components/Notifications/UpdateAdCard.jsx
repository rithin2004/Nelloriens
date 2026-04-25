import React from 'react';
import { ExternalLink } from 'lucide-react';

const UpdateAdCard = ({ ad }) => {
  if (!ad) return null;

  return (
    <div 
      className="group relative w-full bg-blue-50/40 backdrop-blur-xl border border-blue-100/50 rounded-[28px] p-8 mb-6 
        shadow-[0_8px_32px_0_rgba(59,130,246,0.05)] transition-all duration-300 ease-out cursor-pointer
        animate-fade-in-up overflow-hidden"
      onClick={() => window.open(ad.link || '#', '_blank')}
    >
      {/* Visual Identity: Subtle Grid Pattern or Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      
      <div className="flex flex-col md:flex-row gap-6 items-center lg:items-start relative z-10">
        {/* Ad Image / Visual */}
        <div className="w-full md:w-48 h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-white/50 shadow-sm">
          <img 
            src={ad.image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=300&h=200'}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* Ad Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/60 bg-blue-500/5 px-2 py-0.5 rounded">
              Sponsored
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-[#0f172a] mb-2 group-hover:text-blue-600 transition-colors">
            {ad.title}
          </h3>
          
          <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
            {ad.subtitle || ad.description || 'Discover amazing local opportunities and professional services in Nellore.'}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-2 text-blue-600 font-extrabold text-xs uppercase tracking-widest">
            <span>{ad.buttonText || 'Learn More'}</span>
            <ExternalLink size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateAdCard;
