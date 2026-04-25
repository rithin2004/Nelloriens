import React from 'react';

const EventsSkeleton = ({ type = 'grid' }) => {
  const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent";

  if (type === 'categories') {
    return (
      <div className="flex gap-4 overflow-hidden py-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`shrink-0 w-32 h-20 rounded-2xl bg-slate-200 ${shimmer}`} />
        ))}
      </div>
    );
  }

  if (type === 'carousel') {
    return (
      <div className={`w-full h-[300px] md:h-[450px] rounded-4xl bg-slate-200 ${shimmer}`} />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 p-4 flex flex-col h-[380px]">
          <div className={`h-32 rounded-2xl bg-slate-200 mb-4 ${shimmer}`} />
          <div className={`h-6 w-3/4 bg-slate-200 rounded-lg mb-3 ${shimmer}`} />
          <div className={`h-3 w-full bg-slate-200 rounded-md mb-2 ${shimmer}`} />
          <div className={`h-3 w-5/6 bg-slate-200 rounded-md mb-6 ${shimmer}`} />
          <div className="mt-auto flex items-center justify-between bg-slate-50/80 rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-slate-200 ${shimmer}`} />
              <div className="flex flex-col gap-1">
                <div className={`h-2 w-16 bg-slate-200 rounded-md ${shimmer}`} />
                <div className={`h-2 w-12 bg-slate-200 rounded-md ${shimmer}`} />
              </div>
            </div>
            <div className={`w-5 h-5 bg-slate-200 rounded-md ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsSkeleton;
