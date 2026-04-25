import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import BreakingNews from "./BreakingNews";

const MainHeader = () => {
  const { data: footerData } = useSelector((state) => state.footer);
  const logoSrc = footerData?.logo || null;
  const siteName = footerData?.siteName || "NELLORIENS";

  return (
    <div className="bg-white border-b border-slate-100">
      <div className="flex items-center justify-between gap-6 py-2 px-4 lg:px-10">
        {/* Logo + site name — desktop only */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-3 no-underline">
            {logoSrc && (
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: '#0a3d95' }}>
                <img
                  src={logoSrc}
                  alt={siteName}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            )}
            <h1 className="text-[1.75rem] font-extrabold m-0 tracking-tight uppercase" style={{ color: '#0a3d95' }}>{siteName}</h1>
          </Link>
        </div>
        {/* Breaking news — all screens, right side on desktop */}
        <div className="flex-1 min-w-0 lg:flex-none lg:w-[55%]">
          <BreakingNews />
        </div>
      </div>
    </div>
  );
};

export default MainHeader;
