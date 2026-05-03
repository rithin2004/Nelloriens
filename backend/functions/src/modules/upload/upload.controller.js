import busboy from 'busboy'
import { uploadService, getModuleConfig } from './upload.service.js'
import { badReq } from '../../utils/serviceBase.js'
import { nextId } from '../../utils/sequentialId.js'

// Firebase Functions pre-buffers the request into req.rawBody.
// Multer cannot work here because it tries to pipe an already-consumed stream.
// We use busboy directly and feed it req.rawBody.
export const uploadMiddleware = (req, res, next) => {
  if (req.method !== 'POST') return next()

  const bb = busboy({ headers: req.headers, limits: { fileSize: 50 * 1024 * 1024 } })
  const body = {}
  let fileData = null

  bb.on('field', (fieldname, val) => {
    body[fieldname] = val
  })

  bb.on('file', (fieldname, fileStream, info) => {
    const { filename, mimeType } = info
    const chunks = []
    fileStream.on('data', (data) => chunks.push(data))
    fileStream.on('end', () => {
      const buffer = Buffer.concat(chunks)
      fileData = {
        fieldname,
        originalname: filename,
        mimetype: mimeType,
        buffer,
        size: buffer.length
      }
    })
  })

  bb.on('finish', () => {
    req.body = { ...req.body, ...body }
    if (fileData) req.file = fileData
    next()
  })

  bb.on('error', (err) => next(err))

  bb.end(req.rawBody)
}

export const uploadCtrl = {
  /** Reserve the next sequential ID for a given prefix before creating content.
   *  GET /upload/reserve-id?prefix=NEWS → { success: true, data: { id: 'NEWS00001' } }
   */
  async reserveId(req, res) {
    const { prefix } = req.query
    if (!prefix?.trim()) badReq('prefix is required')
    const id = await nextId(prefix.trim().toUpperCase())
    res.json({ success: true, message: 'OK', data: { id } })
  },

  async upload(req, res) {
    const { module: moduleName } = req.params
    if (!moduleName) badReq('module param is required')

    const config = getModuleConfig(moduleName)
    if (!config) badReq(`Unknown upload module: ${moduleName}`)

    const { contentId, section, index } = req.body
    const result = await uploadService.upload(moduleName, req.file, { contentId, section, index })
    res.json({ success: true, message: 'Uploaded', data: { url: result.url, fileName: result.fileName, size: result.size, mimeType: result.mimeType } })
  },

  async deleteFile(req, res) {
    const { url } = req.body
    await uploadService.deleteByUrl(url)
    res.json({ success: true, message: 'File deleted', data: null })
  },
}
