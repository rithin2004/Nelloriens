import React from 'react';

const Loader = ({ message = "Loading data from admin side..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] w-full animate-in fade-in duration-500">
      <div className="relative w-20 h-20">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
        {/* Inner Ring (Reverse) */}
        <div className="absolute inset-2 rounded-full border-4 border-slate-100 border-b-indigo-500 animate-spin-reverse opacity-70"></div>
        {/* Center Dot */}
        <div className="absolute inset-[30px] bg-blue-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
      </div>
      
      <div className="mt-8 text-center">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{message}</h3>
        <p className="text-sm text-slate-500 mt-2 font-medium">Please wait a moment</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
      `}} />
    </div>
  );
};

export default Loader;
