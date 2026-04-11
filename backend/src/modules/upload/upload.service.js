import { bucket }              from '../../config/firebase.js'
import { fileTypeFromBuffer }  from 'file-type'
import { v4 as uuidv4 }        from 'uuid'
import path                    from 'path'
import { badReq }              from '../../utils/serviceBase.js'

// ── Per-module upload config ──────────────────────────────────────────────
const MODULES = {
  news:         { types: ['image/jpeg','image/png','image/webp','image/gif'],               maxSize: 10 * 1024 * 1024 },
  jobs:         { types: ['image/jpeg','image/png','image/webp'],                           maxSize:  5 * 1024 * 1024 },
  results:      { types: ['image/jpeg','image/png','image/webp','application/pdf'],          maxSize: 10 * 1024 * 1024 },
  sports:       { types: ['image/jpeg','image/png','image/webp','image/gif'],               maxSize: 10 * 1024 * 1024 },
  foods:        { types: ['image/jpeg','image/png','image/webp'],                           maxSize:  5 * 1024 * 1024 },
  history:      { types: ['image/jpeg','image/png','image/webp'],                           maxSize: 10 * 1024 * 1024 },
  stays:        { types: ['image/jpeg','image/png','image/webp'],                           maxSize: 10 * 1024 * 1024 },
  events:       { types: ['image/jpeg','image/png','image/webp','image/gif'],               maxSize: 10 * 1024 * 1024 },
  movies:       { types: ['image/jpeg','image/png','image/webp'],                           maxSize:  5 * 1024 * 1024 },
  transport:    { types: ['image/jpeg','image/png','image/webp'],                           maxSize:  5 * 1024 * 1024 },
  offers:       { types: ['image/jpeg','image/png','image/webp'],                           maxSize:  5 * 1024 * 1024 },
  tourism:      { types: ['image/jpeg','image/png','image/webp'],                           maxSize: 10 * 1024 * 1024 },
  updates:      { types: ['image/jpeg','image/png','image/webp'],                           maxSize:  5 * 1024 * 1024 },
  ads:          { types: ['image/jpeg','image/png','image/webp','image/gif','video/mp4'],   maxSize: 20 * 1024 * 1024 },
  sponsorships: { types: ['image/jpeg','image/png','image/webp'],                           maxSize:  5 * 1024 * 1024 },
  instagram:    { types: ['image/jpeg','image/png','image/webp','video/mp4'],               maxSize: 50 * 1024 * 1024 },
  company:      { types: ['image/jpeg','image/png','image/webp','image/svg+xml'],           maxSize:  5 * 1024 * 1024 },
  users:        { types: ['image/jpeg','image/png','image/webp'],                           maxSize:  2 * 1024 * 1024 },
}

// Extension map for MIME types
const MIME_EXT = {
  'image/jpeg':       '.jpg',
  'image/png':        '.png',
  'image/webp':       '.webp',
  'image/gif':        '.gif',
  'image/svg+xml':    '.svg',
  'application/pdf':  '.pdf',
  'video/mp4':        '.mp4',
}

export function getModuleConfig(moduleName) {
  return MODULES[moduleName] || null
}

export const uploadService = {
  async upload(moduleName, file) {
    if (!file) badReq('No file provided')

    const config = MODULES[moduleName]
    if (!config) badReq(`Unknown upload module: ${moduleName}`)

    // Size check
    if (file.size > config.maxSize) {
      badReq(`File too large. Max size for ${moduleName}: ${config.maxSize / (1024 * 1024)}MB`)
    }

    // Magic byte validation
    const detected = await fileTypeFromBuffer(file.buffer)
    const mime     = detected?.mime || ''

    // SVG won't be detected by file-type (it's XML text), allow it if declared
    const effectiveMime = mime || file.mimetype

    if (!config.types.includes(effectiveMime)) {
      badReq(`File type "${effectiveMime}" is not allowed for ${moduleName}. Allowed: ${config.types.join(', ')}`)
    }

    const ext      = MIME_EXT[effectiveMime] || path.extname(file.originalname) || ''
    const fileName = `${moduleName}/${uuidv4()}${ext}`
    const fileRef  = bucket.file(fileName)

    await fileRef.save(file.buffer, {
      metadata: {
        contentType:  effectiveMime,
        metadata: { firebaseStorageDownloadTokens: uuidv4() },
      },
    })

    await fileRef.makePublic()
    const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`
    return { url, fileName, size: file.size, mimeType: effectiveMime }
  },

  async deleteByUrl(url) {
    if (!url) badReq('url is required')
    const match = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)/)
    if (!match) badReq('Invalid storage URL')
    const filePath = decodeURIComponent(match[1])
    await bucket.file(filePath).delete()
    return true
  },
}
