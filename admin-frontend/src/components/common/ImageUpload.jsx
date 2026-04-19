import { useRef, useState } from 'react'
import { Upload, X, Loader } from 'lucide-react'
import { uploadApi } from '../../services/api'
import toast from 'react-hot-toast'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

/**
 * @param {string}  module      Storage module folder (e.g. 'news')
 * @param {string}  contentId   The content ID this file belongs to (RULE 10)
 * @param {string}  [section]   Sub-folder (default: 'thumbnails') — e.g. 'posters', 'logos'
 * @param {number}  [index]     Index for multiple files on one content item
 */
export default function ImageUpload({ module, contentId, section, index, value, onChange, label = 'Image', altValue = '', onAltChange }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5 MB'); return }
    const fd = new FormData()
    fd.append('file', file)
    if (contentId) fd.append('contentId', contentId)
    if (section)   fd.append('section',   section)
    if (index !== undefined) fd.append('index', String(index))
    try {
      setUploading(true)
      const res = await uploadApi.upload(module, fd)
      onChange(res.data.data.url)
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (value) { try { await uploadApi.delete(value) } catch { /* ignore storage delete errors */ } }
    onChange('')
    if (onAltChange) onAltChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      {value ? (
        <div className="space-y-2">
          <div className="relative inline-block">
            <img src={value} alt={altValue || 'preview'} className="w-32 h-32 object-cover rounded-xl"
              style={{ border: `1px solid ${PL}` }} />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full text-white shadow-md transition-colors"
              style={{ background: '#EF4444' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#EF4444'}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {/* Alt text */}
          {onAltChange !== undefined && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Alt Text (for SEO & accessibility)</label>
              <input
                type="text"
                value={altValue}
                onChange={(e) => onAltChange(e.target.value)}
                placeholder="Describe this image…"
                className="w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none transition-all"
                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}
                onFocus={(e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }}
                onBlur={(e)  => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }}
              />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center w-32 h-32 rounded-xl transition-all disabled:opacity-50"
          style={{ background: PB, border: `2px dashed ${PL}` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = P; e.currentTarget.style.background = PL }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = PL; e.currentTarget.style.background = PB }}
        >
          {uploading
            ? <Loader className="w-5 h-5 animate-spin" style={{ color: P }} />
            : <Upload className="w-5 h-5" style={{ color: P }} />
          }
          <span className="text-xs mt-1.5 text-slate-500">
            {uploading ? 'Uploading…' : 'Click to upload'}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
