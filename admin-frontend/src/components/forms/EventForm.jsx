import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import RichTextEditor from '../common/RichTextEditor'
import ImageUpload from '../common/ImageUpload'
import MapPicker from '../common/MapPicker'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { eventsApi } from '../../services/api'

const field   = 'block text-sm font-medium text-slate-700 mb-1'
const input   = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

/**
 * EventForm — handles both regular events and influencer events (RULE 27)
 * - Regular events: have categories, isPopular toggle (RULE 13 max 3/category)
 * - Influencer events: NO categories, max 5 globally, have influencerName field
 */
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

export default function EventForm({ defaultValues, onSubmit, loading, contentId, isInfluencer = false, onDirtyChange }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({ defaultValues })
  const [categories,            setCategories]            = useState([])
  const [eventLocations,        setEventLocations]        = useState([])
  const [isPopular,             setIsPopular]             = useState(defaultValues?.isPopular  || false)
  const [isVerified,            setIsVerified]            = useState(defaultValues?.isVerified || false)
  const [registrationRequired,  setRegistrationRequired]  = useState(defaultValues?.registrationRequired || false)
  const [description,           setDescription]           = useState(defaultValues?.description || '')
  const [thumbnail,             setThumbnail]             = useState(defaultValues?.thumbnail || '')
  const [startDate,             setStartDate]             = useState(defaultValues?.startDate ? new Date(defaultValues.startDate) : null)
  const [endDate,               setEndDate]               = useState(defaultValues?.endDate   ? new Date(defaultValues.endDate)   : null)
  const [regStartDate,          setRegStartDate]          = useState(defaultValues?.registrationStartDate ? new Date(defaultValues.registrationStartDate) : null)
  const [regEndDate,            setRegEndDate]            = useState(defaultValues?.registrationEndDate   ? new Date(defaultValues.registrationEndDate)   : null)
  const [mapLocation,           setMapLocation]           = useState({ lat: defaultValues?.latitude, lng: defaultValues?.longitude })

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  useEffect(() => {
    if (!isInfluencer) {
      eventsApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
      eventsApi.getLocations().then((r) => setEventLocations(r.data.data || [])).catch(() => {})
    }
  }, [isInfluencer])

  const submit = (data) => {
    onSubmit({
      ...data,
      description,
      thumbnail,
      isPopular,
      isVerified,
      registrationRequired,
      startDate:              startDate?.toISOString(),
      endDate:                endDate?.toISOString(),
      registrationStartDate:  registrationRequired ? regStartDate?.toISOString() : null,
      registrationEndDate:    registrationRequired ? regEndDate?.toISOString()   : null,
      latitude:               mapLocation.lat,
      longitude:              mapLocation.lng,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        {/* RULE 13 — isPopular toggle top-right, visual switch, regular events only */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">
            {isInfluencer ? 'Influencer Event Details' : 'Event Details'}
          </h3>
          <div className="flex items-center gap-3">
            {!isInfluencer && (
              <ToggleSwitch id="event-popular" checked={isPopular} onChange={setIsPopular}
                label="Popular" hint="(max 3/category)" />
            )}
            <ToggleSwitch id="event-verified" checked={isVerified} onChange={setIsVerified} label="Verified" />
          </div>
        </div>

        <div>
          <label htmlFor="event-name" className={field}>Event Name *</label>
          <input id="event-name" name="eventName" autoComplete="off"
            {...register('eventName', { required: 'Event name is required' })}
            className={input} />
          {errors.eventName && <p className="text-xs mt-1 text-red-600">{errors.eventName.message}</p>}
        </div>

        {/* Influencer Name — only for influencer events */}
        {isInfluencer && (
          <div>
            <label htmlFor="event-influencer" className={field}>Influencer Name *</label>
            <input id="event-influencer" name="influencerName" autoComplete="off"
              {...register('influencerName', { required: 'Influencer name is required' })}
              className={input} placeholder="e.g. John Doe" />
            {errors.influencerName && <p className="text-xs mt-1 text-red-600">{errors.influencerName.message}</p>}
          </div>
        )}

        {/* Category — only for regular events */}
        {!isInfluencer && (
          <div>
            <label htmlFor="event-category" className={field}>Category *</label>
            <select id="event-category" name="category" autoComplete="off"
              {...register('category', { required: 'Category is required' })}
              className={input}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.category && <p className="text-xs mt-1 text-red-600">{errors.category.message}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-start" className={field}>Start Date & Time *</label>
            <DatePicker
              id="event-start"
              selected={startDate}
              onChange={setStartDate}
              showTimeSelect
              dateFormat="dd/MM/yyyy HH:mm"
              placeholderText="Select start date"
              className={input}
            />
          </div>
          <div>
            <label htmlFor="event-end" className={field}>End Date & Time</label>
            <DatePicker
              id="event-end"
              selected={endDate}
              onChange={setEndDate}
              showTimeSelect
              dateFormat="dd/MM/yyyy HH:mm"
              minDate={startDate}
              placeholderText="Select end date"
              className={input}
            />
          </div>
        </div>

        <div>
          <label htmlFor="event-venue" className={field}>Venue Name *</label>
          <input id="event-venue" name="venueName" autoComplete="off"
            {...register('venueName', { required: 'Venue is required' })}
            className={input} />
          {errors.venueName && <p className="text-xs mt-1 text-red-600">{errors.venueName.message}</p>}
        </div>

        <ImageUpload
          module="events" label="Thumbnail *"
          value={thumbnail} onChange={setThumbnail}
          contentId={contentId} section="thumbnails"
        />

        <div>
          <p className={field}>Description</p>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location (optional)</h3>
        <MapPicker lat={mapLocation.lat} lng={mapLocation.lng} onChange={(latlng) => setMapLocation(latlng)} />
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Additional Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-fee" className={field}>Entry Fee</label>
            <input id="event-fee" name="entryFee" autoComplete="off"
              {...register('entryFee')} className={input} placeholder="₹200 or Free" />
          </div>
          {!isInfluencer && (
            <div>
              <label htmlFor="event-organizer" className={field}>Organizer</label>
              <input id="event-organizer" name="organizer" autoComplete="off"
                {...register('organizer')} className={input} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-phone" className={field}>Contact Phone</label>
            <input id="event-phone" name="contactPhone" type="tel" autoComplete="tel"
              {...register('contactPhone')} className={input} />
          </div>
          <div>
            <label htmlFor="event-ticket" className={field}>Ticket URL</label>
            <input id="event-ticket" name="ticketUrl" type="url" autoComplete="url"
              {...register('ticketUrl')} className={input} />
          </div>
        </div>

        {!isInfluencer && (
          <div className="rounded-lg p-4 space-y-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between">
              <p className={field} style={{ marginBottom: 0 }}>Registration</p>
              <ToggleSwitch id="event-registration-req" checked={registrationRequired}
                onChange={setRegistrationRequired} label="Registration Required" />
            </div>
            {registrationRequired && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-reg-start" className={field}>Registration Opens</label>
                    <DatePicker id="event-reg-start" selected={regStartDate} onChange={setRegStartDate}
                      showTimeSelect dateFormat="dd/MM/yyyy HH:mm" placeholderText="Select date"
                      className={input} />
                  </div>
                  <div>
                    <label htmlFor="event-reg-end" className={field}>Registration Closes</label>
                    <DatePicker id="event-reg-end" selected={regEndDate} onChange={setRegEndDate}
                      showTimeSelect dateFormat="dd/MM/yyyy HH:mm" minDate={regStartDate}
                      placeholderText="Select date" className={input} />
                  </div>
                </div>
                <div>
                  <label htmlFor="event-reg-url" className={field}>Registration URL</label>
                  <input id="event-reg-url" name="registrationUrl" type="url" autoComplete="url"
                    {...register('registrationUrl')} className={input} placeholder="https://…" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location & Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-scope" className={field}>Scope *</label>
            <select id="event-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={input}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="event-city" className={field}>City</label>
            <input id="event-city" name="city" autoComplete="address-level2"
              {...register('city')} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-location" className={field}>Location</label>
            <select id="event-location" name="location" autoComplete="off"
              {...register('location')} className={input}>
              <option value="">Select location</option>
              {eventLocations.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="event-region" className={field}>Region</label>
            <input id="event-region" name="region" autoComplete="off"
              {...register('region')} className={input} />
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
