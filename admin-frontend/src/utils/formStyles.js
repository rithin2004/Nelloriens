/**
 * Shared dark-theme form style constants.
 * Import these wherever form fields are used.
 */

/** Dark input / select / textarea base class */
export const inputCls = [
  'w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500',
  'focus:outline-none transition-all',
].join(' ')

export const inputStyle = {
  background: '#1E293B',
  border: '1px solid #334155',
}

export const inputFocusStyle = {
  borderColor: '#3B82F6',
  boxShadow: '0 0 0 3px rgba(59,130,246,0.15)',
}

/** Label class */
export const labelCls = 'block text-sm font-medium mb-1.5'
export const labelStyle = { color: '#CBD5E1' }

/** Section card (groups related fields) */
export const sectionCls = 'rounded-xl p-5 space-y-4'
export const sectionStyle = { background: '#111827', border: '1px solid #1E293B' }

/** Primary submit button */
export const submitBtnCls = 'w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50'
export const submitBtnStyle = {
  background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
  boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
}

/** Error text */
export const errorCls = 'text-xs mt-1'
export const errorStyle = { color: '#F87171' }

/** Helper: apply focus styles via onFocus/onBlur handlers */
export function focusHandlers(el) {
  return {
    onFocus: () => Object.assign(el.style, inputFocusStyle),
    onBlur: () => {
      el.style.borderColor = '#334155'
      el.style.boxShadow = ''
    },
  }
}
