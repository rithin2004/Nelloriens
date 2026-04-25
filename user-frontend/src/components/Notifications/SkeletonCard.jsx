import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="w-full bg-white/60 backdrop-blur-md border border-white rounded-3xl p-6 mb-4 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100/50"></div>
          <div>
            <div className="h-4 w-32 bg-blue-100/30 rounded-md mb-2"></div>
            <div className="h-3 w-20 bg-slate-100 rounded-md"></div>
          </div>
        </div>
        <div className="h-6 w-16 bg-blue-50 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-100/80 rounded-md"></div>
        <div className="h-4 w-3/4 bg-slate-100/80 rounded-md"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between">
        <div className="h-3 w-24 bg-slate-100/60 rounded-sm"></div>
        <div className="h-3 w-16 bg-slate-100/60 rounded-sm"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
