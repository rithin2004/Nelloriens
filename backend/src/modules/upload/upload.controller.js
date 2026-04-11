import multer from 'multer'
import { uploadService, getModuleConfig } from './upload.service.js'
import { badReq } from '../../utils/serviceBase.js'

// Memory storage — file.buffer available for magic byte check
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50MB hard cap; per-module limits in service
})

export const uploadMiddleware = multerUpload.single('file')

export const uploadCtrl = {
  async upload(req, res) {
    const { module: moduleName } = req.params
    if (!moduleName) badReq('module param is required')

    const config = getModuleConfig(moduleName)
    if (!config) badReq(`Unknown upload module: ${moduleName}`)

    const result = await uploadService.upload(moduleName, req.file)
    res.json({ success: true, url: result.url, fileName: result.fileName, size: result.size, mimeType: result.mimeType })
  },

  async deleteFile(req, res) {
    const { url } = req.body
    await uploadService.deleteByUrl(url)
    res.json({ success: true, message: 'File deleted' })
  },
}
