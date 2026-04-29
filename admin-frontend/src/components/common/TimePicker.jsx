const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

function parseTime(value) {
  if (!value) return { h: '12', m: '00', a: 'AM' }
  const m12 = String(value).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (m12) {
    const h = String(parseInt(m12[1]) || 12).padStart(2, '0')
    const m = m12[2].padStart(2, '0')
    const roundedM = MINUTES.includes(m) ? m : MINUTES.reduce((prev, cur) =>
      Math.abs(parseInt(cur) - parseInt(m)) < Math.abs(parseInt(prev) - parseInt(m)) ? cur : prev
    )
    return { h: HOURS.includes(h) ? h : '12', m: roundedM, a: m12[3].toUpperCase() }
  }
  const m24 = String(value).match(/^(\d{1,2}):(\d{2})$/)
  if (m24) {
    let hr = parseInt(m24[1])
    const mn = String(parseInt(m24[2]) || 0).padStart(2, '0')
    const roundedM = MINUTES.includes(mn) ? mn : MINUTES.reduce((prev, cur) =>
      Math.abs(parseInt(cur) - parseInt(mn)) < Math.abs(parseInt(prev) - parseInt(mn)) ? cur : prev
    )
    const ap = hr < 12 ? 'AM' : 'PM'
    if (hr === 0) hr = 12
    else if (hr > 12) hr -= 12
    return { h: String(hr).padStart(2, '0'), m: roundedM, a: ap }
  }
  return { h: '12', m: '00', a: 'AM' }
}

export default function TimePicker({ id, value, onChange, selectClassName, selectStyle }) {
  const { h, m, a } = parseTime(value)

  const sel = selectClassName ||
    'px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-800'

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={id} className="sr-only">Hour</label>
      <select id={id} value={h} onChange={(e) => onChange(`${e.target.value}:${m} ${a}`)}
        className={sel} style={selectStyle}>
        {HOURS.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <span className="text-slate-400 font-semibold select-none text-sm">:</span>
      <label htmlFor={`${id}-min`} className="sr-only">Minute</label>
      <select id={`${id}-min`} value={m} onChange={(e) => onChange(`${h}:${e.target.value} ${a}`)}
        className={sel} style={selectStyle}>
        {MINUTES.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <label htmlFor={`${id}-ampm`} className="sr-only">AM or PM</label>
      <select id={`${id}-ampm`} value={a} onChange={(e) => onChange(`${h}:${m} ${e.target.value}`)}
        className={sel} style={selectStyle}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}
