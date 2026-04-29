import React from "react";
import { X, ExternalLink } from "lucide-react";

const YtIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF0000">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
  </svg>
);
import { Link } from "react-router-dom";

const sanitizeHtml = (html) =>
  html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/\s+on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');

const CAPITALIZE_FIELDS = new Set([
  "company", "organization", "organizer", "companyName",
  "location", "venue", "from", "to", "operator",
  "trainType", "busType", "type",
  "language", "genre", "categoryName", "category",
]);

const SKIP_FIELDS = new Set([
  "_id", "id", "__v", "createdAt", "updatedAt", "publishedBy",
  "lastModifiedAt", "lastModifiedBy", "pageViews", "cardViews", "impressions",
  "clicks", "touches", "scope", "city", "region", "isPopular", "isImportant",
  "isTop", "is24x7", "status", "_liveScore",
]);

const isUrl = (val) => typeof val === "string" && /^https?:\/\//.test(val);

const isHtmlContent = (val) =>
  typeof val === "string" && /<(p|br|ul|ol|h[1-3]|blockquote)[\s>/]/i.test(val);

const formatLabel = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
};

const YouTubeEmbed = ({ videoId, label }) => (
  <div className="mb-5">
    {label && (
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">{label}</p>
    )}
    <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={label || "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
    <a
      href={`https://www.youtube.com/watch?v=${videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 mt-2 text-[0.78rem] font-semibold no-underline transition-opacity hover:opacity-80"
      style={{ color: '#FF0000' }}
    >
      <YtIcon />
      View on YouTube
    </a>
  </div>
);

/**
 * DetailModal
 *
 * actionButtons: Array of { label, url?, to?, variant? }
 *   url  → opens in new tab (external)
 *   to   → React Router internal link (closes modal on click)
 *   YouTube url → renders embed + "View on YouTube" instead of a button
 */
const DetailModal = ({ item, onClose, title, actionButtons }) => {
  if (!item) return null;

  const imageUrl = item.thumbnail || item.image || item.poster || item.imageUrl || null;
  const displayTitle = title || item.title || item.eventName || item.name || item.sportName || "Details";

  // Collect YouTube videos: first from actionButtons, then from item URL fields
  const youtubeEmbeds = [];
  const regularButtons = [];

  (actionButtons || []).forEach((btn) => {
    const ytId = getYouTubeId(btn.url);
    if (ytId) {
      youtubeEmbeds.push({ id: ytId, label: btn.label, url: btn.url });
    } else {
      regularButtons.push(btn);
    }
  });

  // Fields to render (skip images, skip already-shown YouTube URLs)
  const fields = Object.entries(item).filter(([key, val]) => {
    if (SKIP_FIELDS.has(key)) return false;
    if (val === null || val === undefined || val === "") return false;
    if (key === "image" || key === "poster" || key === "thumbnail" || key === "imageUrl") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    // Allow arrays of objects (e.g. fareDetails) — handled in render below
    if (typeof val === "object" && !Array.isArray(val)) return false;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image — skip if there are YouTube embeds (they take priority) */}
        {imageUrl && youtubeEmbeds.length === 0 && (
          <div className="relative h-56 w-full overflow-hidden rounded-t-3xl">
            <img src={imageUrl} alt={displayTitle} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <h2 className="text-xl font-black text-slate-900 leading-tight pr-4">{displayTitle}</h2>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* YouTube embeds */}
          {youtubeEmbeds.map((v) => (
            <YouTubeEmbed key={v.id} videoId={v.id} label={youtubeEmbeds.length > 1 ? v.label : null} />
          ))}

          {/* Image shown below embeds if both exist */}
          {imageUrl && youtubeEmbeds.length > 0 && (
            <div className="mb-5 overflow-hidden rounded-xl">
              <img src={imageUrl} alt={displayTitle} className="w-full object-cover max-h-48" />
            </div>
          )}

          {/* Fields */}
          <div className="space-y-3">
            {fields.map(([key, val]) => {
              if (key === "title" || key === "name" || key === "eventName" || key === "sportName") return null;

              // Inline YouTube URL in fields → skip (already handled above or render embed here)
              const ytId = isUrl(val) ? getYouTubeId(val) : null;
              if (ytId) {
                return (
                  <YouTubeEmbed key={key} videoId={ytId} label={formatLabel(key)} />
                );
              }

              if (isHtmlContent(val)) {
                return (
                  <div key={key}>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">{formatLabel(key)}</p>
                    <div
                      className="text-sm text-slate-700 leading-relaxed rich-text"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(val) }}
                    />
                  </div>
                );
              }

              if (isUrl(val)) {
                return (
                  <div key={key}>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">{formatLabel(key)}</p>
                    <a
                      href={val}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 no-underline hover:underline"
                    >
                      View Link <ExternalLink size={13} />
                    </a>
                  </div>
                );
              }

              if (Array.isArray(val)) {
                // Array of objects (e.g. fareDetails [{class, fare}])
                if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
                  return (
                    <div key={key}>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">{formatLabel(key)}</p>
                      <div className="flex flex-wrap gap-2">
                        {val.map((entry, idx) => {
                          const parts = Object.entries(entry)
                            .map(([k, v]) => `${formatLabel(k)}: ${v}`)
                            .join(" · ");
                          return (
                            <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "#F1F5F9", color: "#475569" }}>
                              {parts}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={key} className="flex gap-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide min-w-24 pt-0.5 shrink-0">{formatLabel(key)}</span>
                    <span className="text-sm text-slate-700">{val.join(', ')}</span>
                  </div>
                );
              }

              return (
                <div key={key} className="flex gap-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide min-w-24 pt-0.5 shrink-0">{formatLabel(key)}</span>
                  <span className={`text-sm text-slate-700${CAPITALIZE_FIELDS.has(key) ? " capitalize" : ""}`}>{String(val)}</span>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          {regularButtons.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100">
              {regularButtons.map((btn, i) =>
                btn.to ? (
                  <Link
                    key={i}
                    to={btn.to}
                    onClick={onClose}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 no-underline ${
                      btn.variant === "outline"
                        ? "border-2 border-blue-600 text-blue-600 bg-white"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-100"
                    }`}
                  >
                    {btn.label}
                  </Link>
                ) : btn.onClick ? (
                  <button
                    key={i}
                    onClick={btn.onClick}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 ${
                      btn.variant === "outline"
                        ? "border-2 border-blue-600 text-blue-600 bg-white"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-100"
                    }`}
                  >
                    {btn.label}
                  </button>
                ) : (
                  <a
                    key={i}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 no-underline ${
                      btn.variant === "outline"
                        ? "border-2 border-blue-600 text-blue-600 bg-white"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-100"
                    }`}
                  >
                    {btn.label} <ExternalLink size={13} />
                  </a>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
