import { useState } from 'react'
import { useForm } from 'react-hook-form'
import MapPicker from '../common/MapPicker'

const lbl = 'block text-sm font-medium mb-1.5'
const lblStyle = { color: '#374151' }
const section = 'rounded-xl p-5 space-y-4'
const sectionStyle = { background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const inp = 'w-full px-3 py-2.5 rounded-lg text-sm'

export default function TheatreForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, setValue } = useForm({ defaultValues })
  const [location, setLocation] = useState({
    lat: defaultValues?.latitude,
    lng: defaultValues?.longitude,
  })

  const handleMapChange = ({ lat, lng }) => {
    setLocation({ lat, lng })
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  const submit = (data) => {
    onSubmit({ ...data, latitude: location.lat, longitude: location.lng })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section} style={sectionStyle}>
        <h3 className="font-semibold text-slate-800">Theatre Details</h3>

        <div>
          <label htmlFor="th-name" className={lbl} style={lblStyle}>Theatre Name *</label>
          <input id="th-name" name="name" autoComplete="organization"
            {...register('name', { required: true })} className={inp} />
        </div>

        <div>
          <label htmlFor="th-address" className={lbl} style={lblStyle}>Address *</label>
          <input id="th-address" name="address" autoComplete="street-address"
            {...register('address', { required: true })} className={inp} />
        </div>

        <MapPicker lat={location.lat} lng={location.lng} onChange={handleMapChange} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="th-phone" className={lbl} style={lblStyle}>Phone</label>
            <input id="th-phone" name="phone" type="tel" autoComplete="tel"
              {...register('phone')} className={inp} />
          </div>
          <div>
            <label htmlFor="th-screens" className={lbl} style={lblStyle}>Screen Count</label>
            <input id="th-screens" name="screenCount" type="number" min="1" autoComplete="off"
              {...register('screenCount')} className={inp} />
          </div>
        </div>

        <div>
          <label htmlFor="th-maps" className={lbl} style={lblStyle}>Google Maps URL</label>
          <input id="th-maps" name="googleMapsUrl" type="url" autoComplete="url"
            {...register('googleMapsUrl')} className={inp} />
        </div>

      </div>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
        {loading ? 'Saving...' : 'Save Theatre'}
      </button>
    </form>
  )
}
