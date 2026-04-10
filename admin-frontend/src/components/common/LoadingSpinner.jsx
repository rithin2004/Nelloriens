export default function LoadingSpinner({ fullScreen = false }) {
  const spinner = (
    <div className="flex items-center justify-center py-12">
      <div
        className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '3px solid #dce8fb', borderTopColor: '#0a3d95' }}
      />
    </div>
  )

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ background: 'rgba(240,249,255,0.8)', backdropFilter: 'blur(4px)' }}
      >
        {spinner}
      </div>
    )
  }

  return spinner
}
