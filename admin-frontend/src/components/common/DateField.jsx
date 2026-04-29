import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar } from 'lucide-react'

const DEFAULT_CLASS = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'

export default function DateField({ id, className, isClearable, style: callerStyle, ...props }) {
  return (
    <div className="relative">
      <DatePicker
        id={id}
        wrapperClassName="w-full"
        className={className || DEFAULT_CLASS}
        style={{ paddingRight: isClearable ? '3rem' : '2rem', ...callerStyle }}
        isClearable={isClearable}
        {...props}
      />
      <label
        htmlFor={id}
        aria-label="Open date picker"
        className={`absolute top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${isClearable ? 'right-7' : 'right-2.5'}`}
        style={{ color: '#0a3d95' }}
      >
        <Calendar className="w-4 h-4" />
      </label>
    </div>
  )
}
