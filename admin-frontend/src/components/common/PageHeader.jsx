import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, MousePointerClick } from 'lucide-react'

export default function PageHeader({ title, subtitle, action, backTo, pageViews, cardViews }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            style={{ border: '1px solid #E2E8F0' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">{title}</h1>
            {pageViews != null && (
              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Eye className="w-3.5 h-3.5" />
                {pageViews.toLocaleString('en-IN')}
              </span>
            )}
            {cardViews != null && (
              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <MousePointerClick className="w-3.5 h-3.5" />
                {cardViews.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm mt-0.5 text-slate-500 leading-tight">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}
