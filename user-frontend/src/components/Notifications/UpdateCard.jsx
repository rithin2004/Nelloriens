import React from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { CATEGORY_MAPPING } from './constants';

const UpdateCard = ({ update, isExpanded, onToggle }) => {
  const category = CATEGORY_MAPPING[update.category] || CATEGORY_MAPPING.news;
  const CategoryIcon = category.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`group relative w-full bg-white/70 backdrop-blur-xl border border-white rounded-[28px] p-6 mb-4 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] transition-all duration-300 ease-out cursor-pointer
        hover:scale-[1.01] hover:-translate-y-1 hover:bg-white/90 hover:border-blue-100/50 
        ${category.glow} ${isExpanded ? 'ring-2 ring-blue-100' : ''}`}
      onClick={onToggle}
    >
      {/* Light Glass Subtle Border Glow */}
      <div className="absolute inset-0 rounded-[28px] pointer-events-none 
                    shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] opacity-50"></div>

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-2xl ${category.color.replace('10', '20')} border flex items-center justify-center`}>
            <CategoryIcon size={20} className={category.iconColor.replace('400', '600')} />
          </div>
          <div>
            <h3 className="text-[#0f172a] font-bold text-lg leading-tight group-hover:text-blue-700 transition-colors">
              {update.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border ${category.color.replace('10', '20')} ${category.iconColor.replace('400', '600')}`}>
                {category.label}
              </span>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                <Clock size={12} />
                <span>{formatDate(update.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
        <button className="text-slate-300 group-hover:text-blue-500 transition-colors">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-height-1000 opacity-100 mt-4' : 'max-h-12 opacity-80'
        }`}
        style={{ maxHeight: isExpanded ? '400px' : '48px' }}
      >
        <p className={`text-slate-600 leading-relaxed font-medium ${!isExpanded ? 'line-clamp-2' : ''}`}>
          {update.description}
        </p>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center animate-fade-in">
          <span className="text-slate-300 text-[11px] font-bold tracking-wide">
            ID: {update.id.toString().toUpperCase()}
          </span>
          <button 
            className="text-xs font-extrabold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            SHOW UPDATE
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateCard;
