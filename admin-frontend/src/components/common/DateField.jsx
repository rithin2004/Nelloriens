import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar } from 'lucide-react'

const DEFAULT_CLASS = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'

export default function DateField({ className, isClearable, style: callerStyle, ...props }) {
  return (
    <div className="relative">
      <DatePicker
        wrapperClassName="w-full"
        className={className || DEFAULT_CLASS}
        style={{ paddingRight: isClearable ? '3rem' : '2rem', ...callerStyle }}
        isClearable={isClearable}
        {...props}
      />
      <Calendar
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ${isClearable ? 'right-7' : 'right-2.5'}`}
      />
    </div>
  )
}
