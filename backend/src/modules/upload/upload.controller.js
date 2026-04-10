import { uploadService } from './upload.service.js'
import { handleErr }     from '../../utils/serviceBase.js'
import multer            from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only images and PDFs are allowed'))
    }
  },
})

export const uploadMiddleware = upload.single('file')

export const uploadCtrl = {
  async upload(req, res) {
    try {
      const data = await uploadService.upload(req.file)
      res.status(201).json({ success: true, data })
    } catch (err) { handleErr(res, err) }
  },

  async deleteFile(req, res) {
    try {
      await uploadService.deleteByUrl(req.body?.url)
      res.json({ success: true, message: 'Deleted' })
    } catch (err) { handleErr(res, err) }
  },
}
