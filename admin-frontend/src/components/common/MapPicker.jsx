import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { NELLORE_CENTER } from '../../utils/constants'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function MapPicker({ lat, lng, onChange }) {
  const center = lat && lng ? [lat, lng] : [NELLORE_CENTER.lat, NELLORE_CENTER.lng]

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Location (click map to pin)
      </label>
      <div className="rounded-lg overflow-hidden border border-slate-300" style={{ height: 300 }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          {lat && lng && <Marker position={[lat, lng]} />}
        </MapContainer>
      </div>
      {lat && lng && (
        <p className="text-xs text-slate-500 mt-1">
          Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}
