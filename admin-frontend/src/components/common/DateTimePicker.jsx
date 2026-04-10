import { useState, useRef, useEffect } from 'react'
import { Calendar, Clock, ChevronLeft, X } from 'lucide-react'

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December']

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }

function boxBtn(active, onMouseEnter, onMouseLeave, onClick, children, small = false) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="rounded-lg font-semibold transition-all focus:outline-none"
      style={{
        padding: small ? '5px 2px' : '7px 4px',
        fontSize: small ? '12px' : '13px',
        background: active ? P : '#F8FAFC',
        color: active ? '#FFFFFF' : '#374151',
        border: `1px solid ${active ? P : '#E2E8F0'}`,
      }}
    >
      {children}
    </button>
  )
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder = 'Select date & time',
  showTime = true,
  isClearable = false,
  label,
}) {
  const now    = new Date()
  const parsed = value ? new Date(value) : null

  const [open,      setOpen]      = useState(false)
  const [step,      setStep]      = useState('year')
  const [selYear,   setSelYear]   = useState(parsed?.getFullYear()  ?? now.getFullYear())
  const [selMonth,  setSelMonth]  = useState(parsed?.getMonth()     ?? now.getMonth())
  const [selDay,    setSelDay]    = useState(parsed?.getDate()       ?? now.getDate())
  const [selHour,   setSelHour]   = useState(parsed ? (parsed.getHours() % 12 || 12) : 12)
  const [selMinute, setSelMinute] = useState(parsed?.getMinutes()   ?? 0)
  const [selAmPm,   setSelAmPm]   = useState(parsed ? (parsed.getHours() >= 12 ? 'PM' : 'AM') : 'AM')

  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setStep('year') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Sync internal state when value changes externally
  useEffect(() => {
    if (!value) return
    const d = new Date(value)
    setSelYear(d.getFullYear())
    setSelMonth(d.getMonth())
    setSelDay(d.getDate())
    setSelHour(d.getHours() % 12 || 12)
    setSelMinute(d.getMinutes())
    setSelAmPm(d.getHours() >= 12 ? 'PM' : 'AM')
  }, [value])

  const commit = (y, mo, d, h, mi, ap) => {
    const h24 = ap === 'PM' ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h)
    onChange(new Date(y, mo, d, h24, mi, 0).toISOString())
  }

  const pickYear  = (y)  => { setSelYear(y);  setStep('month') }
  const pickMonth = (mo) => { setSelMonth(mo); setStep('day') }
  const pickDay   = (d)  => {
    setSelDay(d)
    if (showTime) { setStep('time') }
    else { commit(selYear, selMonth, d, selHour, selMinute, selAmPm); setOpen(false); setStep('year') }
  }
  const confirmTime = () => {
    commit(selYear, selMonth, selDay, selHour, selMinute, selAmPm)
    setOpen(false); setStep('year')
  }
  const goBack = () => setStep(step === 'time' ? 'day' : step === 'day' ? 'month' : 'year')

  const displayValue = parsed
    ? `${parsed.getDate()} ${MONTHS_FULL[parsed.getMonth()]} ${parsed.getFullYear()}${showTime
        ? ` · ${parsed.getHours() % 12 || 12}:${String(parsed.getMinutes()).padStart(2, '0')} ${parsed.getHours() >= 12 ? 'PM' : 'AM'}`
        : ''}`
    : ''

  const curYear = now.getFullYear()
  const years   = Array.from({ length: 16 }, (_, i) => curYear - 5 + i)
  const days    = Array.from({ length: daysInMonth(selYear, selMonth) }, (_, i) => i + 1)

  const hover = (active) => ({
    enter: (e) => { if (!active) { e.currentTarget.style.background = PB; e.currentTarget.style.borderColor = P } },
    leave: (e) => { if (!active) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0' } },
  })

  const stepLabel = {
    year:  'Select Year',
    month: `${selYear} — Select Month`,
    day:   `${MONTHS_FULL[selMonth]} ${selYear} — Select Day`,
    time:  `${selDay} ${MONTHS_SHORT[selMonth]} ${selYear} — Set Time`,
  }

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}

      {/* Trigger button */}
      <div
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer select-none text-sm transition-all"
        style={{
          background: '#FFFFFF',
          border: `1px solid ${open ? P : '#CBD5E1'}`,
          boxShadow: open ? `0 0 0 3px rgba(10,61,149,0.1)` : '',
        }}
      >
        {showTime
          ? <Clock className="w-4 h-4 shrink-0" style={{ color: P }} />
          : <Calendar className="w-4 h-4 shrink-0" style={{ color: P }} />
        }
        <span className="flex-1" style={{ color: displayValue ? '#0F172A' : '#94A3B8' }}>
          {displayValue || placeholder}
        </span>
        {isClearable && value && (
          <button type="button"
            onClick={(e) => { e.stopPropagation(); onChange('') }}
            className="p-0.5 rounded hover:bg-slate-100 transition-colors">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 mt-2 rounded-2xl overflow-hidden"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${PL}`,
            boxShadow: '0 16px 48px rgba(10,61,149,0.18)',
            minWidth: '300px',
            left: 0,
          }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: P }}>
            <div className="flex items-center gap-2">
              {step !== 'year' && (
                <button type="button" onClick={goBack}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <span className="text-sm font-bold text-white">{stepLabel[step]}</span>
            </div>
            <button type="button" onClick={() => { setOpen(false); setStep('year') }}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4">
            {/* ── Year ── */}
            {step === 'year' && (
              <div className="grid grid-cols-4 gap-2">
                {years.map((y) => {
                  const active = y === selYear
                  const h = hover(active)
                  return (
                    <button key={y} type="button" onClick={() => pickYear(y)}
                      onMouseEnter={h.enter} onMouseLeave={h.leave}
                      className="rounded-lg font-semibold transition-all focus:outline-none py-1.5 text-sm"
                      style={{ background: active ? P : '#F8FAFC', color: active ? '#FFF' : '#374151', border: `1px solid ${active ? P : '#E2E8F0'}` }}>
                      {y}
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Month ── */}
            {step === 'month' && (
              <div className="grid grid-cols-3 gap-2">
                {MONTHS_SHORT.map((m, i) => {
                  const active = i === selMonth
                  const h = hover(active)
                  return (
                    <button key={m} type="button" onClick={() => pickMonth(i)}
                      onMouseEnter={h.enter} onMouseLeave={h.leave}
                      className="rounded-lg font-semibold transition-all focus:outline-none py-2 text-sm"
                      style={{ background: active ? P : '#F8FAFC', color: active ? '#FFF' : '#374151', border: `1px solid ${active ? P : '#E2E8F0'}` }}>
                      {m}
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Day ── */}
            {step === 'day' && (
              <div className="grid grid-cols-7 gap-1">
                {days.map((d) => {
                  const active = d === selDay
                  const h = hover(active)
                  return (
                    <button key={d} type="button" onClick={() => pickDay(d)}
                      onMouseEnter={h.enter} onMouseLeave={h.leave}
                      className="rounded-lg font-semibold transition-all focus:outline-none py-1.5 text-xs"
                      style={{ background: active ? P : '#F8FAFC', color: active ? '#FFF' : '#374151', border: `1px solid ${active ? P : '#E2E8F0'}` }}>
                      {d}
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Time ── */}
            {step === 'time' && showTime && (
              <div className="space-y-4">
                <div className="flex items-end gap-3 justify-center">
                  {/* Hours */}
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1.5 font-medium">Hour</p>
                    <input
                      type="number" min={1} max={12} value={selHour}
                      onChange={(e) => { let v = parseInt(e.target.value) || 1; if (v < 1) v = 1; if (v > 12) v = 12; setSelHour(v) }}
                      className="w-16 text-center text-2xl font-bold rounded-xl py-2 focus:outline-none"
                      style={{ background: PB, border: `2px solid ${P}`, color: P }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-slate-300 pb-2">:</span>
                  {/* Minutes */}
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1.5 font-medium">Minute</p>
                    <input
                      type="number" min={0} max={59} value={selMinute}
                      onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v) || v < 0) v = 0; if (v > 59) v = 59; setSelMinute(v) }}
                      className="w-16 text-center text-2xl font-bold rounded-xl py-2 focus:outline-none"
                      style={{ background: PB, border: `2px solid ${P}`, color: P }}
                    />
                  </div>
                  {/* AM / PM */}
                  <div className="flex flex-col gap-1.5 pb-1">
                    {['AM', 'PM'].map((ap) => (
                      <button key={ap} type="button" onClick={() => setSelAmPm(ap)}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all focus:outline-none"
                        style={selAmPm === ap
                          ? { background: P, color: '#FFF', border: `1px solid ${P}` }
                          : { background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0' }}>
                        {ap}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick minute presets */}
                <div>
                  <p className="text-xs text-slate-400 mb-2 text-center">Quick minutes</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 15, 30, 45].map((m) => (
                      <button key={m} type="button" onClick={() => setSelMinute(m)}
                        className="py-1.5 rounded-lg text-sm font-semibold transition-all focus:outline-none"
                        style={selMinute === m
                          ? { background: P, color: '#FFF', border: `1px solid ${P}` }
                          : { background: '#F8FAFC', color: '#374151', border: '1px solid #E2E8F0' }}>
                        :{String(m).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={confirmTime}
                  className="w-full py-2.5 text-white font-semibold rounded-xl transition-all hover:opacity-90"
                  style={{ background: P, boxShadow: '0 4px 16px rgba(10,61,149,0.3)' }}>
                  Confirm — {selHour}:{String(selMinute).padStart(2, '0')} {selAmPm}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
