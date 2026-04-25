import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdvertiseBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full mb-12 px-0">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 to-blue-800 p-8 md:p-12 text-center text-white shadow-xl">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-blue-100/80 mb-3">
            SPONSORED
          </span>

          <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight tracking-tight">
            Advertise Your Business Here
          </h2>
          
          <p className="text-base md:text-lg text-blue-50/90 mb-8 max-w-2xl">
            Reach thousands of local residents daily
          </p>
          
          <button 
            className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
            onClick={() => navigate('/contact')}
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvertiseBanner;
