import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFooterData } from '../../state/slices/footerSlice';
import useTranslation from '../../hooks/useTranslation';

const SocialIcons = {
  facebook:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  twitter:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  youtube:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>,
  linkedin:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  whatsapp:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
};

const Footer = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { data: footerData, status: footerStatus } = useSelector((state) => state.footer);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (footerStatus === 'idle') dispatch(fetchFooterData());
  }, [dispatch, footerStatus]);

  const siteName = footerData?.siteName || "";
  const tagline = footerData?.tagline || "";
  const translatedSiteName = siteName === 'NELLORIENS' ? t('siteName') + '.IN' : siteName;
  const translatedTagline = (tagline || "").startsWith('Your trusted gateway') ? t('FooterTagline') : tagline;
  const logoSrc = footerData?.logo || null;
  const hasEmail = !!footerData?.email;
  const hasPhones = footerData?.phones?.length > 0;
  const hasLocation = !!footerData?.location;
  const hasSocial = footerData?.socialLinks?.length > 0;

  const renderIcon = (platform) => {
    const IconComponent = SocialIcons[platform];
    return IconComponent ? <IconComponent /> : <Globe size={18} />;
  };

  return (
    <footer className="text-white p-0 overflow-x-hidden" style={{ background: 'linear-gradient(160deg, #0a3d95 0%, #0B66D1 50%, #0c52c4 100%)' }}>
      <div className="w-full px-4 lg:px-10">
        {/* Main grid */}
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-8 mb-6 pt-12 max-[1024px]:grid-cols-2 max-sm:grid-cols-1">
          {/* Info — spans full width on tablet so link columns sit 2×2 below */}
          <div className="flex flex-col max-[1024px]:col-span-2 max-[1024px]:pb-6 max-[1024px]:border-b max-[1024px]:border-white/10 max-sm:items-center max-sm:text-center max-sm:pb-4 max-sm:border-0">
            <Link to="/" className="flex items-center gap-4 mb-4 no-underline" style={{ color: 'inherit' }}>
              {logoSrc && (
                <div className="w-13 h-13 rounded-full bg-white/15 flex items-center justify-center shrink-0 overflow-hidden border border-white/20">
                  <img
                    src={logoSrc}
                    alt={footerData?.siteName || siteName}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                  />
                </div>
              )}
              <h3 className="text-[1.6rem] font-extrabold m-0 text-white tracking-tight uppercase">{footerData?.siteName || translatedSiteName}</h3>
            </Link>
            <div className="w-10 h-0.5 mb-4 max-sm:mx-auto" style={{ background: '#1A9AF5' }} />
            {translatedTagline && (
              <p className="text-[0.92rem] text-white/75 leading-relaxed m-0">{translatedTagline}</p>
            )}
            {hasSocial && (
              <div className="flex gap-3 mt-6 max-sm:justify-center max-sm:flex-wrap">
                {footerData.socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    className="w-9 h-9 rounded-full flex items-center justify-center no-underline transition-all duration-300 hover:-translate-y-0.5"
                    style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1A9AF5'; e.currentTarget.style.borderColor = '#1A9AF5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {renderIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links columns */}
          {[
            {
              heading: 'News & Updates',
              links: [
                { label: t('News'),    path: '/news'    },
                { label: t('Updates'), path: '/updates' },
                { label: t('Results'), path: '/results' },
                { label: t('Jobs'),    path: '/jobs'    },
              ],
            },
            {
              heading: 'Events & Sports',
              links: [
                { label: t('Events'),  path: '/events'  },
                { label: t('Sports'),  path: '/sports'  },
                { label: t('Offers'),  path: '/offers'  },
                { label: t('Movies'),  path: '/movies'  },
              ],
            },
            {
              heading: 'Explore Nellore',
              links: [
                { label: t('Tourism'),        path: '/tourism'      },
                { label: t('FamousFoods'),    path: '/famous-foods' },
                { label: t('FamousStay'),     path: '/famousstay'   },
                { label: t('NelloreHistory'), path: '/history'      },
              ],
            },
            {
              heading: 'More',
              links: [
                { label: t('Transport'),  path: '/transport'   },
                { label: t('RealEstate'), path: '/real-estate' },
                { label: t('ContactUs'),  path: '/contact'     },
              ],
            },
          ].map((col) => (
            <div key={col.heading} className="flex flex-col max-sm:hidden">
              <h4 className="text-[1.05rem] font-bold mb-1 text-white tracking-wide">{col.heading}</h4>
              <div className="w-7 h-0.5 mb-4" style={{ background: '#1A9AF5' }} />
              <ul className="list-none p-0 m-0">
                {col.links.map((link) => (
                  <li key={link.path} className="mb-2.5">
                    <Link
                      to={link.path}
                      className="no-underline transition-colors duration-200 text-[0.92rem] font-medium"
                      style={{ color: 'rgba(255,255,255,0.75)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.paddingLeft = '4px'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.paddingLeft = '0'; }}
                    >
                      › {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        {(hasEmail || hasPhones || hasLocation) && (
          <div className="border-t border-white/10 pt-8 grid grid-cols-3 gap-8 max-sm:grid-cols-1 max-sm:gap-6 max-sm:text-center">
            {hasEmail && (
              <div className="flex items-start gap-4 max-sm:flex-col max-sm:items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(26,154,245,0.2)', border: '1px solid rgba(26,154,245,0.4)' }}>
                  <Mail size={18} className="text-[#1A9AF5]" />
                </div>
                <div>
                  <h5 className="text-[0.95rem] font-bold m-0 mb-1 text-white">{t('EmailUs')}</h5>
                  <a href={`mailto:${footerData.email}`} className="text-[0.88rem] no-underline transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.7)' }} onMouseEnter={e => e.currentTarget.style.color='#fff'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}>{footerData.email}</a>
                </div>
              </div>
            )}
            {hasPhones && (
              <div className="flex items-start gap-4 max-sm:flex-col max-sm:items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(26,154,245,0.2)', border: '1px solid rgba(26,154,245,0.4)' }}>
                  <Phone size={18} className="text-[#1A9AF5]" />
                </div>
                <div>
                  <h5 className="text-[0.95rem] font-bold m-0 mb-1 text-white">{t('CallUs')}</h5>
                  <div className="flex flex-col gap-0.5">
                    {footerData.phones.map((phone, i) => (
                      <a key={i} href={`tel:${phone.replace(/\s+/g, '')}`} className="text-[0.88rem] no-underline transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.7)' }} onMouseEnter={e => e.currentTarget.style.color='#fff'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}>{phone}</a>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {hasLocation && (
              <div className="flex items-start gap-4 max-sm:flex-col max-sm:items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(26,154,245,0.2)', border: '1px solid rgba(26,154,245,0.4)' }}>
                  <MapPin size={18} className="text-[#1A9AF5]" />
                </div>
                <div>
                  <h5 className="text-[0.95rem] font-bold m-0 mb-1 text-white">{t('Location')}</h5>
                  <p className="text-[0.88rem] text-white/70 m-0">{footerData.location}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Copyright */}
        <div className="mt-10">
          <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)' }} />
          <div className="py-5 text-center">
            <p className="m-0 text-[0.82rem] text-white/55 tracking-wide">
              © {currentYear} <span className="font-semibold text-white/75 uppercase">{footerData?.siteName || translatedSiteName}</span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
