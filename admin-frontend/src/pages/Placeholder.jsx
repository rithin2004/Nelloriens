import Card from '../components/ui/Card'

export default function Placeholder({ page }) {
  const label = page.charAt(0).toUpperCase() + page.slice(1)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Home</span><span>/</span>
        <span className="text-slate-900 font-medium">{label}</span>
      </div>
      <Card className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{label} Page</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">
          This page is ready for your content. Connect it to your API to get started.
        </p>
      </Card>
    </div>
  )
}
