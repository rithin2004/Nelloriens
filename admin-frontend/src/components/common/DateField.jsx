import { useRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar } from 'lucide-react'

const DEFAULT_CLASS = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'

export default function DateField({ className, isClearable, style: callerStyle, ...props }) {
  const dpRef = useRef(null)

  return (
    <div className="relative">
      <DatePicker
        ref={dpRef}
        wrapperClassName="w-full"
        className={className || DEFAULT_CLASS}
        style={{ paddingRight: isClearable ? '3rem' : '2rem', ...callerStyle }}
        isClearable={isClearable}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Open date picker"
        onClick={() => dpRef.current?.setOpen(true)}
        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors ${isClearable ? 'right-7' : 'right-2.5'}`}
      >
        <Calendar className="w-4 h-4" />
      </button>
    </div>
  )
}
