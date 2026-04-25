import { useState } from "react";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useTranslation from "../../hooks/useTranslation";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const { data: footerData } = useSelector((state) => state.footer);
  const logoSrc = footerData?.logo || null;
  const siteName = footerData?.siteName || "NELLORIENS";

  const navItems = [
    { label: t("Home"), path: "/" },
    { label: t("News"), path: "/news" },
    { label: t("Jobs"), path: "/jobs" },
    { label: t("Updates"), path: "/updates" },
    { label: t("Events"), path: "/events" },
    { label: t("Results"), path: "/results" },
    { label: t("Sports"), path: "/sports" },
    { label: t("FamousStay"), path: "/famousstay" },
    { label: t("Transport"), path: "/transport" },
    { label: t("Offers"), path: "/offers" },
    { label: t("Tourism"), path: "/tourism" },
    { label: t("FamousFoods"), path: "/famous-foods" },
    { label: t("NelloreHistory"), path: "/history" },
    { label: t("Movies"), path: "/movies" },
    { label: t("RealEstate"), path: "/real-estate" },
    { label: t("ContactUs"), path: "/contact" },
  ];

  const items = navItems;

  const desktopLinkClass = (isActive) =>
    `flex items-center gap-1.5 py-2 px-3 no-underline transition-all duration-[250ms] text-[0.88rem] font-medium rounded-full my-[0.45rem] whitespace-nowrap xl:text-[0.82rem] xl:py-[0.42rem] xl:px-2.5${isActive ? " bg-white/25 font-bold" : " hover:bg-white/12"}`;

  const drawerLinkClass = (isActive) =>
    `flex items-center gap-1.5 no-underline transition-colors duration-200 text-base font-medium justify-start whitespace-normal w-full py-3.5 px-6 rounded-none my-0 max-[480px]:py-3 max-[480px]:px-4.5 max-[480px]:text-[0.95rem] max-[360px]:py-3 max-[360px]:px-4 max-[360px]:text-[0.9rem]${isActive ? " bg-white/[0.22] border-l-4 border-white pl-5 font-bold max-[480px]:pl-3.5 max-[360px]:pl-4" : " hover:bg-white/12"}`;

  return (
    <nav
      className="relative z-100 text-white p-0 overflow-visible"
      style={{ background: 'linear-gradient(to right, #0a3d95, #0c52c4)' }}
    >
      {/* ── Mobile / Tablet header row: Logo + Name + Hamburger ─── */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline"
          style={{ color: '#ffffff' }}
        >
          {logoSrc && (
            <div
              className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <img
                src={logoSrc}
                alt={siteName}
                className="w-full h-full object-contain p-0.5"
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              />
            </div>
          )}
          <span className="font-extrabold text-[1.15rem] tracking-tight text-white">{siteName}</span>
        </Link>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer border-0 transition-colors"
          style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff' }}
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Slide-in Drawer ──────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 h-dvh w-70 z-2000 flex flex-col overflow-hidden transition-[transform,visibility] duration-350 ease-in-out max-md:w-[min(300px,85vw)] max-[480px]:w-[88vw] max-[480px]:max-w-85 max-[360px]:w-[92vw] shadow-[6px_0_30px_rgba(0,0,0,0.35)] ${isMenuOpen ? "translate-x-0 visible" : "-translate-x-[110%] invisible"}`}
        style={{ background: 'linear-gradient(160deg, #0a3d95 0%, #0c52c4 60%, #0e63e8 100%)' }}
      >
        <div className="py-5 px-6 flex justify-between items-center border-b border-white/15 shrink-0 max-[480px]:py-4 max-[480px]:px-4.5">
          <Link
            to="/"
            className="text-[1.2rem] font-extrabold tracking-widest max-[480px]:text-[1.05rem] no-underline"
            style={{ color: '#ffffff' }}
            onClick={() => setIsMenuOpen(false)}
          >{siteName}</Link>
          <div
            className="flex items-center justify-center w-9.5 h-9.5 text-[1.6rem] leading-none cursor-pointer rounded-full bg-white/12 transition-colors hover:bg-white/25 shrink-0"
            onClick={() => setIsMenuOpen(false)}
          >
            &times;
          </div>
        </div>
        <ul
          className="drawer-scroll flex-1 overflow-y-auto overscroll-contain list-none m-0 p-0"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 30px)', WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="w-full block">
                <Link
                  to={item.path}
                  className={drawerLinkClass(isActive)}
                  style={{ color: '#ffffff' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Backdrop ─────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-black/55 backdrop-blur-sm z-1999 transition-[opacity,visibility] duration-350 ease-in-out ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* ── Desktop nav links ────────────────────────────────────── */}
      <ul className="hidden lg:flex items-center justify-center flex-wrap w-full py-2 px-4 lg:px-10 gap-0.5 list-none m-0 mb-0">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link to={item.path} className={desktopLinkClass(isActive)} style={{ color: '#ffffff' }}>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
