import multer from 'multer'
import { uploadService, getModuleConfig } from './upload.service.js'
import { badReq } from '../../utils/serviceBase.js'
import { nextId } from '../../utils/sequentialId.js'

// Memory storage — file.buffer available for magic byte check
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50MB hard cap; per-module limits in service
})

export const uploadMiddleware = multerUpload.single('file')

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
