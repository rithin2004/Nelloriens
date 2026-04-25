import { useSelector } from "react-redux";

const BreakingNews = () => {
  const breakingPoints = useSelector((state) => state.news.breakingPoints || []);

  const newsContent =
    breakingPoints.length > 0 ? (
      breakingPoints.map((item, index) => (
        <span key={item._id || index} className="text-[0.9rem] text-white max-sm:text-[0.8rem]">
          {item.text}
          {index < breakingPoints.length - 1 && (
            <span className="mx-2 text-white"> • </span>
          )}
        </span>
      ))
    ) : (
      <span className="text-[0.9rem] text-white">Loading live updates from admin...</span>
    );

  return (
    <div className="bg-transparent py-1.5 max-sm:rounded-[15px] max-sm:mt-2.5">
      <div className="bg-[#1a4d94] rounded-full overflow-hidden p-0 flex items-center max-md:flex-col max-md:items-stretch max-md:rounded-[25px]">
        <div className="bg-[#e32b3b] text-white px-6 py-2 flex items-center gap-2.5 font-extrabold whitespace-nowrap shrink-0 rounded-full text-[0.85rem] tracking-[0.5px] max-md:w-full max-md:justify-center max-md:rounded-[25px_25px_0_0] max-sm:px-2 max-sm:text-[0.8rem] max-sm:rounded-[15px_15px_0_0]">
          <span style={{ animation: 'tickerPulse 1.5s ease-in-out infinite', fontSize: '0.9rem', fontWeight: 'bold' }}>((o))</span>
          <span className="text-[0.9rem] tracking-[0.5px] max-sm:text-[0.8rem]">BREAKING NEWS</span>
        </div>
        <div className="flex-1 overflow-hidden py-3 px-6 bg-[#204a92] relative max-md:w-full max-md:py-2 max-md:px-4 max-sm:p-2">
          <div className="w-full overflow-hidden">
            <div
              className="inline-flex whitespace-nowrap"
              style={{ animation: 'tickerSlide 12s linear infinite', willChange: 'transform' }}
            >
              {newsContent}
              {breakingPoints.length > 0 && (
                <>
                  <span className="mx-8 text-white"> • </span>
                  {newsContent}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;
