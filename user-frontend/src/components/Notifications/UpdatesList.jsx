import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { nowIST } from '../../utils/timezone';
import { ChevronUp } from 'lucide-react';
import UpdateCard from './UpdateCard';
import UpdateAdCard from './UpdateAdCard';

const AD_PLACEMENT_RULE = "smart_one_per_section";

const UpdatesList = ({ updates, loading, expandedId, onToggleExpand, showInlineAds }) => {
  // Access Ads from Redux
  const { 
    commonAds = [],
    sponsored = [],
    mockSponsored = [],
  } = useSelector((state) => state.commonAds || {});

  // Merge sources for reliable ad pool
  const adPool = [...sponsored, ...commonAds].length > 0 
    ? [...sponsored, ...commonAds] 
    : mockSponsored;

  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const groupUpdates = (items) => {
    const today = nowIST();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const groups = {
      Today: [],
      'This Week': [],
      Earlier: []
    };

    items.forEach(item => {
      const itemDate = new Date(new Date(item.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const itemDay = new Date(itemDate);
      itemDay.setHours(0, 0, 0, 0);

      if (itemDay.getTime() === today.getTime()) {
        groups.Today.push(item);
      } else if (itemDay.getTime() >= oneWeekAgo.getTime()) {
        groups['This Week'].push(item);
      } else {
        groups.Earlier.push(item);
      }
    });

    return groups;
  };

  const grouped = groupUpdates(updates);

  if (loading) return null;

  const allEmpty = Object.values(grouped).every(g => g.length === 0);

  if (allEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-12 py-20 bg-white/5 backdrop-blur-md rounded-4xl border border-white/10">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">📭</span>
        </div>
        <h3 className="text-xl font-bold text-[#0f172a] mb-2">No updates yet</h3>
        <p className="text-slate-400 text-center max-w-xs">
          Our team is working hard to bring you the latest. Check back later for real-time notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {Object.entries(grouped).map(([title, groupItems], sectionIndex) => {
        if (groupItems.length === 0) return null;
        
        // Select a unique ad for this section if available
        const sectionAd = adPool[sectionIndex % adPool.length];
        const hasAd = sectionAd && showInlineAds && AD_PLACEMENT_RULE === "smart_one_per_section";
        
        const isSectionExpanded = expandedSections[title];
        const displayedItems = isSectionExpanded ? groupItems : groupItems.slice(0, 2);

        return (
          <div key={title} className="animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                {title}
              </h2>
              <div className="flex-1 h-px bg-linear-to-r from-blue-400/20 to-transparent"></div>
            </div>
            
            <div className="space-y-4">
              {displayedItems.map((update, index) => {
                // Ad placement logic adjusted for sliced view
                const isPlacement = (index === 1 && groupItems.length > 2 && !isSectionExpanded) || 
                                   (isSectionExpanded && index === 2 && groupItems.length >= 4) ||
                                   (index === groupItems.length - 1 && groupItems.length < 4);
                
                return (
                  <React.Fragment key={update.id}>
                    <UpdateCard 
                      update={update} 
                      isExpanded={expandedId === update.id}
                      onToggle={() => onToggleExpand(update.id)}
                    />
                    
                    {/* Smart Ad Injection */}
                    {hasAd && isPlacement && (
                      <UpdateAdCard ad={sectionAd} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {isSectionExpanded && groupItems.length > 2 && (
              <button 
                onClick={() => toggleSection(title)}
                className="w-full py-4 mt-6 text-[13px] font-black tracking-widest text-slate-500 bg-slate-50/50 hover:bg-slate-100/60 rounded-3xl transition-all duration-300 border border-slate-200/50 flex items-center justify-center gap-2 group"
              >
                SHOW LESS
                <div className="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform">
                  <ChevronUp size={12} />
                </div>
              </button>
            )}

            {!isSectionExpanded && groupItems.length > 2 && (
              <button 
                onClick={() => toggleSection(title)}
                className="w-full py-4 mt-6 text-[13px] font-black tracking-widest text-[#1e40af] bg-blue-50/50 hover:bg-blue-100/60 rounded-3xl transition-all duration-300 border border-blue-100/50 flex items-center justify-center gap-2 group"
              >
                SEE ALL {groupItems.length} {title.toUpperCase()} UPDATES
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform">
                  {groupItems.length}
                </div>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UpdatesList;
