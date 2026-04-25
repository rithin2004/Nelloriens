import React from 'react';

function Banner() {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-white text-center py-[120px] px-5 w-full min-h-[500px] mb-10 overflow-hidden"
      style={{ background: 'rgba(0,51,153,0.55) url("../../assets/images/Banner_img.jpg") center/cover no-repeat', backgroundBlendMode: 'overlay', fontFamily: '"Poppins", sans-serif' }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-blue-900/55 pointer-events-none" />
      <div className="relative z-10 w-full flex flex-col items-center">
        <span className="text-[50px] font-bold" style={{ fontFamily: 'Verdana, Geneva, Tahoma, sans-serif' }}>N</span>
        <h2 className="text-[1.8rem] font-medium mb-[25px] text-white">Your Gateway to Jobs, News, Travel & More</h2>
        <div className="flex justify-center items-center gap-2.5 mb-8 flex-wrap">
          <input
            type="text"
            placeholder="Search for jobs, news, updates..."
            className="w-[60%] max-w-[500px] py-3.5 px-[100px] border-none rounded-[30px] outline-none text-base shadow-md text-gray-800"
          />
          <button className="bg-[#0B66D1] border-none text-white py-3.5 px-7 rounded-[30px] text-base cursor-pointer whitespace-nowrap transition-all hover:-translate-y-0.5 hover:bg-[#00B8FF] hover:shadow-lg">
            Search
          </button>
        </div>
        <div className="mt-2.5 flex justify-center flex-wrap gap-[15px]">
          {['Latest Jobs', 'Exam Results', 'Breaking News', 'Tourism'].map((label) => (
            <button
              key={label}
              className="bg-white/10 border border-white/30 text-white py-2.5 px-5 rounded-[20px] text-[0.95rem] cursor-pointer transition-all hover:bg-white hover:text-blue-600"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Banner;
