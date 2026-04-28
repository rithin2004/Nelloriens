import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import ImageUpload from '../common/ImageUpload'
import InlineCategoryAdd from '../common/InlineCategoryAdd'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { offersApi } from '../../services/api'

const field = 'block text-sm font-medium text-slate-700 mb-1'
const input = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const section = 'bg-white rounded-xl border border-slate-200 p-5 space-y-4'

function ToggleSwitch({ id, checked, onChange, label }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-semibold text-slate-500">{label}</span>}
      <button type="button" role="switch" aria-checked={checked} id={id}
        onClick={() => onChange(!checked)}
        className="relative inline-flex items-center rounded-full transition-colors w-10 h-6 shrink-0"
        style={{ background: checked ? '#10B981' : '#D1D5DB' }}>
        <span className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
      </button>
    </div>
  )
}

export default function OfferForm({ defaultValues, onSubmit, loading, contentId }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  const [isVerified, setIsVerified] = useState(defaultValues?.isVerified || false)
  const [thumbnail,  setThumbnail]  = useState(defaultValues?.thumbnail  || '')
  const [validFrom,  setValidFrom]  = useState(defaultValues?.validFrom  ? new Date(defaultValues.validFrom)  : null)
  const [validUntil, setValidUntil] = useState(defaultValues?.validUntil ? new Date(defaultValues.validUntil) : null)
  const [categories, setCategories] = useState([])
  const [locations,  setLocations]  = useState([])
  const [offerTypes, setOfferTypes] = useState([])

  const fetchCategories = () => offersApi.getCategories().then((r) => setCategories(r.data.data || [])).catch(() => {})
  const fetchLocations  = () => offersApi.getLocations().then((r)  => setLocations(r.data.data  || [])).catch(() => {})
  const fetchTypes      = () => offersApi.getTypes().then((r)       => setOfferTypes(r.data.data || [])).catch(() => {})

  useEffect(() => { fetchCategories(); fetchLocations(); fetchTypes() }, [])

  const submit = (data) => {
    onSubmit({ ...data, thumbnail, isVerified, validFrom: validFrom?.toISOString(), validUntil: validUntil?.toISOString() })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className={section}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Offer Details</h3>
          <ToggleSwitch id="ofr-verified" checked={isVerified} onChange={setIsVerified} label="Verified" />
        </div>
        <div>
          <label htmlFor="ofr-title" className={field}>Offer Title *</label>
          <input id="ofr-title" name="title" autoComplete="off" {...register('title', { required: true })} className={input} />
        </div>
        <div>
          <label htmlFor="ofr-business" className={field}>Business Name *</label>
          <input id="ofr-business" name="businessName" autoComplete="organization" {...register('businessName', { required: true })} className={input} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="ofr-category" className={field} style={{ marginBottom: 0 }}>Category *</label>
              <InlineCategoryAdd label="Category" placeholder="e.g. Food"
                onAdd={async (name) => { await offersApi.createCategory({ name }); await fetchCategories() }} />
            </div>
            <select id="ofr-category" name="category" autoComplete="off" {...register('category', { required: true })} className={input}>
              <option value="">Select</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="ofr-type" className={field} style={{ marginBottom: 0 }}>Offer Type</label>
              <InlineCategoryAdd label="Type" placeholder="e.g. Flash Sale"
                onAdd={async (name) => { await offersApi.createType({ name }); await fetchTypes() }} />
            </div>
            <select id="ofr-type" name="offerType" autoComplete="off" {...register('offerType')} className={input}>
              <option value="">Select type</option>
              {offerTypes.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <ImageUpload module="offers" label="Thumbnail *" value={thumbnail} onChange={setThumbnail} contentId={contentId} section="thumbnails" />
        <div>
          <label htmlFor="ofr-description" className={field}>Description *</label>
          <textarea id="ofr-description" name="description" autoComplete="off" {...register('description', { required: true })} rows={3} className={input} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ofr-valid-from" className={field}>Valid From *</label>
            <DatePicker id="ofr-valid-from" name="validFrom" selected={validFrom} onChange={setValidFrom} dateFormat="dd/MM/yyyy" className={input} />
          </div>
          <div>
            <label htmlFor="ofr-valid-until" className={field}>Valid Until *</label>
            <DatePicker id="ofr-valid-until" name="validUntil" selected={validUntil} onChange={setValidUntil} dateFormat="dd/MM/yyyy" minDate={validFrom} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ofr-discount" className={field}>Discount %</label>
            <input id="ofr-discount" name="discountPercent" autoComplete="off" {...register('discountPercent')} type="number" min="0" max="100" className={input} />
          </div>
          <div>
            <label htmlFor="ofr-coupon" className={field}>Coupon Code</label>
            <input id="ofr-coupon" name="couponCode" autoComplete="off" {...register('couponCode')} className={input} />
          </div>
        </div>
        <div>
          <label htmlFor="ofr-minpurchase" className={field}>Minimum Purchase (₹)</label>
          <input id="ofr-minpurchase" name="minimumPurchase" autoComplete="off" {...register('minimumPurchase')} type="number" min="0" className={input} placeholder="e.g. 500" />
        </div>
        <div>
          <label htmlFor="ofr-terms" className={field}>Terms &amp; Conditions</label>
          <textarea id="ofr-terms" name="termsAndConditions" autoComplete="off" {...register('termsAndConditions')} rows={3} className={input} placeholder="e.g. Offer valid on selected items only…" />
        </div>
        <div>
          <label htmlFor="ofr-redirect" className={field}>Redirect URL</label>
          <input id="ofr-redirect" name="redirectUrl" type="url" autoComplete="url" {...register('redirectUrl')} className={input} />
        </div>
        <div>
          <label htmlFor="ofr-phone" className={field}>Contact Phone</label>
          <input id="ofr-phone" name="contactPhone" type="tel" autoComplete="tel" {...register('contactPhone')} className={input} />
        </div>
      </div>

      <div className={section}>
        <h3 className="font-semibold text-slate-800">Location &amp; Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="offer-scope" className={field}>Scope *</label>
            <select id="offer-scope" name="scope" autoComplete="off" {...register('scope', { required: 'Required' })} className={input}>
              <option value="nellore">Nellore</option>
              <option value="worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label htmlFor="offer-city" className={field}>City</label>
            <input id="offer-city" name="city" autoComplete="address-level2" {...register('city')} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="offer-location" className={field} style={{ marginBottom: 0 }}>Location</label>
              <InlineCategoryAdd label="Location" placeholder="e.g. Nellore"
                onAdd={async (name) => { await offersApi.createLocation({ name }); await fetchLocations() }} />
            </div>
            <select id="offer-location" name="location" autoComplete="off" {...register('location')} className={input}>
              <option value="">Select location</option>
              {locations.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="offer-region" className={field}>Region</label>
            <input id="offer-region" name="region" autoComplete="off" {...register('region')} className={input} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
