import { useEffect } from 'react'

/**
 * Warns the user before closing/refreshing the tab when there are unsaved changes.
 * For in-app navigation warnings, use the `isDirty` flag in FormModal's onClose handler.
 */
export function useUnsavedWarning(isDirty) {
  useEffect(() => {
    if (!isDirty) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
