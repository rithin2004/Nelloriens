import { useState, useEffect } from "react";
import { ChevronDown, Mail, Phone } from "lucide-react";
import { useSelector } from "react-redux";

const TopHeader = () => {
  const footerData = useSelector((state) => state.footer?.data || {});
  const [currentLang, setCurrentLang] = useState("English");

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const gtCookie = cookies.find((c) => c.trim().startsWith("googtrans="));
    if (gtCookie) {
      const code = gtCookie.split("/").pop();
      const langMap = { en: "English", te: "Telugu", hi: "Hindi", ta: "Tamil" };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (langMap[code]) setCurrentLang(langMap[code]);
    }
  }, []);

  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    setCurrentLang(selected);

    const langMap = { 'English': 'en', 'Telugu': 'te', 'Hindi': 'hi', 'Tamil': 'ta' };
    const code = langMap[selected];

    const googleCombo = document.querySelector('.goog-te-combo');
    if (googleCombo) {
      googleCombo.value = code;
      googleCombo.dispatchEvent(new Event('change'));
    } else {
      document.cookie = `googtrans=/en/${code}; path=/`;
      window.location.reload();
    }
  };

  return (
    <div className="bg-[#0a3d95] text-white text-sm max-sm:text-[0.8rem]">
      <div className="container">
        <div className="flex items-center justify-between py-1.5 px-4 lg:px-10 gap-4 max-md:flex-wrap max-md:justify-center max-md:gap-1.5 max-sm:flex-col max-sm:gap-1">
          <div className="flex items-center gap-3 max-md:gap-2 max-md:flex-wrap max-md:justify-center">
            {footerData.email && (
              <>
                <Mail size={12} className="opacity-85 shrink-0" />
                <span>{footerData.email}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 max-md:gap-2 max-md:flex-wrap max-md:justify-center">
            {footerData.phones && footerData.phones.length > 0 && (
              <>
                <Phone size={12} className="opacity-85 shrink-0" />
                {footerData.phones.map((p, i) => (
                  <span key={i}>{i > 0 && <span className="mx-1 opacity-60">•</span>}{p}</span>
                ))}
              </>
            )}
            <div className="relative inline-flex items-center ml-1">
              <select
                value={currentLang}
                onChange={handleLanguageChange}
                className="appearance-none bg-white/12 border border-white/30 rounded text-white py-0.5 pl-2 pr-6 text-[0.8rem] cursor-pointer transition-all hover:border-white/70 hover:bg-white/20 focus:outline-none focus:border-white/70 focus:bg-white/20"
              >
                <option value="English" className="bg-[#0a3d95] text-white">English</option>
                <option value="Telugu" className="bg-[#0a3d95] text-white">Telugu</option>
                <option value="Hindi" className="bg-[#0a3d95] text-white">Hindi</option>
                <option value="Tamil" className="bg-[#0a3d95] text-white">Tamil</option>
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
