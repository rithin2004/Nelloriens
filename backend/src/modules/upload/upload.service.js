import { bucket }       from '../../config/firebase.js'
import { v4 as uuidv4 } from 'uuid'
import path             from 'path'

export const uploadService = {
  async upload(file) {
    if (!file) throw Object.assign(new Error('No file provided'), { status: 400 })

    const ext      = path.extname(file.originalname) || ''
    const fileName = `uploads/${uuidv4()}${ext}`
    const fileRef  = bucket.file(fileName)

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: { firebaseStorageDownloadTokens: uuidv4() },
      },
    })

    await fileRef.makePublic()
    const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`
    return { url, fileName, size: file.size, mimeType: file.mimetype }
  },

  async deleteByUrl(url) {
    if (!url) throw Object.assign(new Error('url is required'), { status: 400 })
    // Extract file path from URL
    const match = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)/)
    if (!match) throw Object.assign(new Error('Invalid storage URL'), { status: 400 })
    const filePath = decodeURIComponent(match[1])
    await bucket.file(filePath).delete()
    return true
  },
}
