/**
 * TransportForm — RULE 31
 * Fixed sections: train, bus, airport, local (no dynamic category management)
 * Each section has its own specific fields per RULE 31.
 */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import ImageUpload from '../common/ImageUpload'
import TimePicker from '../common/TimePicker'

const lbl   = 'block text-sm font-medium mb-1.5'
const lblSt = { color: '#374151' }
const sec   = 'rounded-xl p-5 space-y-4'
const secSt = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp   = 'w-full px-3 py-2.5 rounded-lg text-sm'
const inpSt = { background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }

function ToggleSwitch({ id, checked, onChange, label, hint }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <button type="button" role="switch" aria-checked={checked} id={id}
        onClick={() => onChange(!checked)}
        className="relative inline-flex items-center rounded-full transition-colors w-10 h-6 shrink-0"
        style={{ background: checked ? '#10B981' : '#D1D5DB' }}>
        <span className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  )
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const TRAIN_TYPES = ['Express','Passenger','Superfast','Mail','Shatabdi','Rajdhani','Duronto','Jan Shatabdi','Other']
const BUS_TYPES   = ['Ordinary','Express','Deluxe','AC Seater','AC Sleeper','Volvo','Non-AC Sleeper','Mini Bus']
const LOCAL_TYPES = ['Auto','Bike Taxi','Rental Car','App-based Cab','City Bus','Other']

function FareTable({ rows, onChange }) {
  const add    = () => onChange([...rows, { class: '', fare: '' }])
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i))
  const update = (i, field, val) => { const r = [...rows]; r[i] = { ...r[i], [field]: val }; onChange(r) }
  return (
    <div>
      <p className={lbl} style={lblSt}>Fare Details</p>
      <div className="space-y-2 mt-1">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              id={`fare-class-${i}`} name={`fareClass${i}`} autoComplete="off"
              value={row.class} onChange={(e) => update(i, 'class', e.target.value)}
              placeholder="Class / Type (e.g. Sleeper)" className={`${inp} flex-1`} style={inpSt} />
            <input
              id={`fare-amount-${i}`} name={`fareAmount${i}`} autoComplete="off"
              value={row.fare} onChange={(e) => update(i, 'fare', e.target.value)}
              placeholder="Fare (e.g. ₹450)" className={`${inp} flex-1`} style={inpSt} />
            <button type="button" onClick={() => remove(i)}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 transition-colors shrink-0"
              style={{ background: 'rgba(239,68,68,0.08)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add}
        className="flex items-center gap-1.5 text-sm mt-2 transition-colors"
        style={{ color: '#A78BFA' }}>
        <Plus className="w-4 h-4" /> Add Fare Row
      </button>
    </div>
  )
}

export default function TransportForm({ defaultValues, onSubmit, loading, contentId, onDirtyChange }) {
  const { register, handleSubmit, watch, formState: { errors, isDirty } } = useForm({
    defaultValues: { type: 'train', is24x7: false, ...defaultValues },
  })
  const [thumbnail,          setThumbnail]          = useState(defaultValues?.thumbnail || '')
  const [is24x7,             setIs24x7]             = useState(defaultValues?.is24x7 || false)
  const [departureTime,      setDepartureTime]      = useState(defaultValues?.departureTime      || '06:00 AM')
  const [arrivalTime,        setArrivalTime]        = useState(defaultValues?.arrivalTime        || '10:00 AM')
  const [operatingHoursFrom, setOperatingHoursFrom] = useState(defaultValues?.operatingHoursFrom || '06:00 AM')
  const [operatingHoursTo,   setOperatingHoursTo]   = useState(defaultValues?.operatingHoursTo   || '10:00 PM')
  const [fareRows,    setFareRows]    = useState(
    Array.isArray(defaultValues?.fareDetails) && defaultValues.fareDetails.length
      ? defaultValues.fareDetails
      : []
  )
  // Days of operation for train (array stored as comma-separated string)
  const [selectedDays, setSelectedDays] = useState(() => {
    const raw = defaultValues?.daysOfOperation || ''
    return typeof raw === 'string' ? raw.split(',').map(d => d.trim()).filter(Boolean) : (raw || [])
  })

  const type = watch('type')

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const submit = (data) => {
    const payload = { ...data, thumbnail }
    if (type === 'train') {
      payload.daysOfOperation = selectedDays.join(',')
      payload.fareDetails = fareRows.filter(r => r.class || r.fare)
      payload.departureTime = departureTime
      payload.arrivalTime = arrivalTime
    }
    if (type === 'bus') {
      payload.fareDetails = fareRows.filter(r => r.class || r.fare)
      payload.departureTime = departureTime
      payload.arrivalTime = arrivalTime
    }
    if (type === 'local') {
      payload.is24x7 = is24x7
      payload.operatingHoursFrom = operatingHoursFrom
      payload.operatingHoursTo = operatingHoursTo
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">

      {/* Type selector — only on create */}
      {!defaultValues?._id && (
        <div className={sec} style={secSt}>
          <div>
            <label htmlFor="transport-type" className={lbl} style={lblSt}>Transport Section *</label>
            <select id="transport-type" name="type" autoComplete="off" {...register('type')} className={inp} style={inpSt}>
              <option value="train">Train</option>
              <option value="bus">Bus</option>
              <option value="airport">Airport</option>
              <option value="local">Local Transport</option>
            </select>
          </div>
        </div>
      )}

      {/* ── TRAIN ── */}
      {type === 'train' && (
        <div className={sec} style={secSt}>
          <h3 className="font-semibold text-slate-800">Train Details</h3>

          <div>
            <label htmlFor="t-name" className={lbl} style={lblSt}>Train Name *</label>
            <input id="t-name" name="name" autoComplete="off"
              {...register('name', { required: 'Train name is required' })}
              className={inp} style={inpSt} placeholder="e.g. Nellore–Chennai Express" />
            {errors.name && <p className="text-xs mt-1 text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="t-number" className={lbl} style={lblSt}>Train Number</label>
              <input id="t-number" name="trainNumber" autoComplete="off"
                {...register('trainNumber')} className={inp} style={inpSt} placeholder="e.g. 12759" />
            </div>
            <div>
              <label htmlFor="t-traintype" className={lbl} style={lblSt}>Train Type</label>
              <select id="t-traintype" name="trainType" autoComplete="off" {...register('trainType')} className={inp} style={inpSt}>
                <option value="">Select</option>
                {TRAIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="t-fromstation" className={lbl} style={lblSt}>From Station</label>
              <input id="t-fromstation" name="fromStation" autoComplete="off"
                {...register('fromStation')} className={inp} style={inpSt} placeholder="e.g. Nellore" />
            </div>
            <div>
              <label htmlFor="t-tostation" className={lbl} style={lblSt}>To Station</label>
              <input id="t-tostation" name="toStation" autoComplete="off"
                {...register('toStation')} className={inp} style={inpSt} placeholder="e.g. Chennai Central" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="t-dep" className={lbl} style={lblSt}>Departure Time</label>
              <TimePicker id="t-dep" value={departureTime} onChange={setDepartureTime} selectStyle={inpSt} />
            </div>
            <div>
              <label htmlFor="t-arr" className={lbl} style={lblSt}>Arrival Time</label>
              <TimePicker id="t-arr" value={arrivalTime} onChange={setArrivalTime} selectStyle={inpSt} />
            </div>
          </div>

          <div>
            <p className={lbl} style={lblSt}>Days of Operation</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {DAYS.map(day => (
                <button key={day} type="button"
                  onClick={() => toggleDay(day)}
                  className="px-3 py-1 text-xs font-semibold rounded-full border transition-all"
                  style={selectedDays.includes(day)
                    ? { background: '#0a3d95', color: '#fff', borderColor: '#0a3d95' }
                    : { background: '#fff', color: '#64748B', borderColor: '#CBD5E1' }}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="t-duration" className={lbl} style={lblSt}>Total Duration</label>
            <input id="t-duration" name="totalDuration" autoComplete="off"
              {...register('totalDuration')} className={inp} style={inpSt} placeholder="e.g. 4h 15m" />
          </div>

          <FareTable rows={fareRows} onChange={setFareRows} />

          <div>
            <label htmlFor="t-booking" className={lbl} style={lblSt}>Booking URL</label>
            <input id="t-booking" name="bookingUrl" type="url" autoComplete="url"
              {...register('bookingUrl')} className={inp} style={inpSt} placeholder="https://…" />
          </div>

          <div>
            <label htmlFor="t-notes" className={lbl} style={lblSt}>Notes</label>
            <textarea id="t-notes" name="notes" autoComplete="off"
              {...register('notes')} rows={2} className={`${inp} resize-none`} style={inpSt} />
          </div>
        </div>
      )}

      {/* ── BUS ── */}
      {type === 'bus' && (
        <div className={sec} style={secSt}>
          <h3 className="font-semibold text-slate-800">Bus Details</h3>

          <div>
            <label htmlFor="b-name" className={lbl} style={lblSt}>Bus / Route Name *</label>
            <input id="b-name" name="name" autoComplete="off"
              {...register('name', { required: 'Bus name is required' })}
              className={inp} style={inpSt} placeholder="e.g. APSRTC Nellore–Hyderabad" />
            {errors.name && <p className="text-xs mt-1 text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="b-routeno" className={lbl} style={lblSt}>Route Number</label>
              <input id="b-routeno" name="routeNumber" autoComplete="off"
                {...register('routeNumber')} className={inp} style={inpSt} placeholder="e.g. Route 99" />
            </div>
            <div>
              <label htmlFor="b-operator" className={lbl} style={lblSt}>Operator Name</label>
              <input id="b-operator" name="operatorName" autoComplete="off"
                {...register('operatorName')} className={inp} style={inpSt} placeholder="e.g. APSRTC" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="b-from" className={lbl} style={lblSt}>From Stop</label>
              <input id="b-from" name="fromStop" autoComplete="off"
                {...register('fromStop')} className={inp} style={inpSt} placeholder="e.g. Nellore Bus Stand" />
            </div>
            <div>
              <label htmlFor="b-to" className={lbl} style={lblSt}>To Stop</label>
              <input id="b-to" name="toStop" autoComplete="off"
                {...register('toStop')} className={inp} style={inpSt} placeholder="e.g. Hyderabad MGBS" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="b-dep" className={lbl} style={lblSt}>Departure Time</label>
              <TimePicker id="b-dep" value={departureTime} onChange={setDepartureTime} selectStyle={inpSt} />
            </div>
            <div>
              <label htmlFor="b-arr" className={lbl} style={lblSt}>Arrival Time</label>
              <TimePicker id="b-arr" value={arrivalTime} onChange={setArrivalTime} selectStyle={inpSt} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="b-freq" className={lbl} style={lblSt}>Frequency</label>
              <input id="b-freq" name="frequency" autoComplete="off"
                {...register('frequency')} className={inp} style={inpSt} placeholder="e.g. Every 30 mins" />
            </div>
            <div>
              <label htmlFor="b-bustype" className={lbl} style={lblSt}>Bus Type</label>
              <select id="b-bustype" name="busType" autoComplete="off" {...register('busType')} className={inp} style={inpSt}>
                <option value="">Select</option>
                {BUS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="b-duration" className={lbl} style={lblSt}>Total Duration</label>
            <input id="b-duration" name="totalDuration" autoComplete="off"
              {...register('totalDuration')} className={inp} style={inpSt} placeholder="e.g. 6h 30m" />
          </div>

          <FareTable rows={fareRows} onChange={setFareRows} />

          <div>
            <label htmlFor="b-booking" className={lbl} style={lblSt}>Booking URL</label>
            <input id="b-booking" name="bookingUrl" type="url" autoComplete="url"
              {...register('bookingUrl')} className={inp} style={inpSt} placeholder="https://…" />
          </div>

          <div>
            <label htmlFor="b-notes" className={lbl} style={lblSt}>Notes</label>
            <textarea id="b-notes" name="notes" autoComplete="off"
              {...register('notes')} rows={2} className={`${inp} resize-none`} style={inpSt} />
          </div>
        </div>
      )}

      {/* ── AIRPORT ── */}
      {type === 'airport' && (
        <div className={sec} style={secSt}>
          <h3 className="font-semibold text-slate-800">Airport Details</h3>

          <div>
            <label htmlFor="a-name" className={lbl} style={lblSt}>Airport Name *</label>
            <input id="a-name" name="name" autoComplete="off"
              {...register('name', { required: 'Airport name is required' })}
              className={inp} style={inpSt} placeholder="e.g. Gannavaram Airport" />
            {errors.name && <p className="text-xs mt-1 text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="a-iata" className={lbl} style={lblSt}>IATA Code</label>
              <input id="a-iata" name="iataCode" autoComplete="off"
                {...register('iataCode')} className={inp} style={inpSt} placeholder="e.g. VGA" />
            </div>
            <div>
              <label htmlFor="a-city" className={lbl} style={lblSt}>City / Location</label>
              <input id="a-city" name="city" autoComplete="off"
                {...register('city')} className={inp} style={inpSt} placeholder="e.g. Vijayawada" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="a-dist" className={lbl} style={lblSt}>Distance from Nellore (km)</label>
              <input id="a-dist" name="distanceFromNellore" type="number" autoComplete="off"
                {...register('distanceFromNellore')} className={inp} style={inpSt} placeholder="e.g. 120" />
            </div>
            <div>
              <label htmlFor="a-travel" className={lbl} style={lblSt}>Approx. Travel Time</label>
              <input id="a-travel" name="approxTravelTime" autoComplete="off"
                {...register('approxTravelTime')} className={inp} style={inpSt} placeholder="e.g. 2 hrs" />
            </div>
          </div>

          <div>
            <label htmlFor="a-airlines" className={lbl} style={lblSt}>Available Airlines</label>
            <input id="a-airlines" name="availableAirlines" autoComplete="off"
              {...register('availableAirlines')} className={inp} style={inpSt} placeholder="e.g. IndiGo, Air India, SpiceJet" />
          </div>

          <div>
            <label htmlFor="a-terminal" className={lbl} style={lblSt}>Terminal Info</label>
            <input id="a-terminal" name="terminalInfo" autoComplete="off"
              {...register('terminalInfo')} className={inp} style={inpSt} placeholder="e.g. 1 terminal, domestic only" />
          </div>

          <div>
            <label htmlFor="a-directions" className={lbl} style={lblSt}>Directions URL</label>
            <input id="a-directions" name="directionsUrl" type="url" autoComplete="url"
              {...register('directionsUrl')} className={inp} style={inpSt} placeholder="https://maps.google.com/…" />
          </div>

          <div>
            <label htmlFor="a-notes" className={lbl} style={lblSt}>Notes</label>
            <textarea id="a-notes" name="notes" autoComplete="off"
              {...register('notes')} rows={2} className={`${inp} resize-none`} style={inpSt} />
          </div>
        </div>
      )}

      {/* ── LOCAL TRANSPORT ── */}
      {type === 'local' && (
        <div className={sec} style={secSt}>
          <h3 className="font-semibold text-slate-800">Local Transport Details</h3>

          <div>
            <label htmlFor="l-name" className={lbl} style={lblSt}>Service Name *</label>
            <input id="l-name" name="name" autoComplete="off"
              {...register('name', { required: 'Service name is required' })}
              className={inp} style={inpSt} placeholder="e.g. Nellore City Auto" />
            {errors.name && <p className="text-xs mt-1 text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="l-servicetype" className={lbl} style={lblSt}>Type</label>
            <select id="l-servicetype" name="serviceType" autoComplete="off" {...register('serviceType')} className={inp} style={inpSt}>
              <option value="">Select type</option>
              {LOCAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="l-coverage" className={lbl} style={lblSt}>Coverage Area</label>
            <input id="l-coverage" name="coverageArea" autoComplete="off"
              {...register('coverageArea')} className={inp} style={inpSt} placeholder="e.g. All of Nellore city" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="l-ophrs-from" className={lbl} style={lblSt}>Operating Hours From</label>
              <TimePicker id="l-ophrs-from" value={operatingHoursFrom} onChange={setOperatingHoursFrom} selectStyle={inpSt} />
            </div>
            <div>
              <label htmlFor="l-ophrs-to" className={lbl} style={lblSt}>Operating Hours To</label>
              <TimePicker id="l-ophrs-to" value={operatingHoursTo} onChange={setOperatingHoursTo} selectStyle={inpSt} />
            </div>
          </div>

          <div>
            <label htmlFor="l-fare" className={lbl} style={lblSt}>Base Fare / Starting Price</label>
            <input id="l-fare" name="baseFare" autoComplete="off"
              {...register('baseFare')} className={inp} style={inpSt} placeholder="e.g. ₹30 minimum" />
          </div>

          <div>
            <label htmlFor="l-contact" className={lbl} style={lblSt}>Contact Number (optional)</label>
            <input id="l-contact" name="contactNumber" type="tel" autoComplete="tel"
              {...register('contactNumber')} className={inp} style={inpSt} />
          </div>

          <div>
            <label htmlFor="l-booking" className={lbl} style={lblSt}>Booking / App URL</label>
            <input id="l-booking" name="bookingUrl" type="url" autoComplete="url"
              {...register('bookingUrl')} className={inp} style={inpSt} placeholder="https://…" />
          </div>

          <div>
            <label htmlFor="l-notes" className={lbl} style={lblSt}>Notes</label>
            <textarea id="l-notes" name="notes" autoComplete="off"
              {...register('notes')} rows={2} className={`${inp} resize-none`} style={inpSt} />
          </div>

          {/* RULE 13 — is24x7 visual switch for Local Transport */}
          <ToggleSwitch id="l-24x7" checked={is24x7} onChange={setIs24x7}
            label="24/7 Service" />
        </div>
      )}

      {/* Thumbnail — all types */}
      <div className={sec} style={secSt}>
        <ImageUpload
          module="transport" label="Thumbnail"
          value={thumbnail} onChange={setThumbnail}
          contentId={contentId} section="thumbnails"
        />
      </div>

      <div className={sec} style={secSt}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="trn-scope" className={lbl} style={lblSt}>Scope *</label>
            <select id="trn-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={inp} style={inpSt}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="trn-region" className={lbl} style={lblSt}>Region</label>
            <input id="trn-region" name="region" autoComplete="off"
              {...register('region')} className={inp} style={inpSt} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
