import { instagramService } from './instagram.service.js'
import { handleErr }        from '../../utils/serviceBase.js'

export const instagramCtrl = {
  async getStatus(req, res) {
    try { res.json({ success: true, data: await instagramService.getStatus() }) }
    catch (err) { handleErr(res, err) }
  },
  async getPosts(req, res) {
    try { res.json({ success: true, data: await instagramService.getPosts() }) }
    catch (err) { handleErr(res, err) }
  },
  async sync(req, res) {
    try { res.json({ success: true, ...(await instagramService.sync()) }) }
    catch (err) { handleErr(res, err) }
  },
  async hidePost(req, res) {
    try { await instagramService.hidePost(req.params.id); res.json({ success: true, message: 'Removed' }) }
    catch (err) { handleErr(res, err) }
  },
  async refreshToken(req, res) {
    try { res.json({ success: true, data: await instagramService.refreshToken() }) }
    catch (err) { handleErr(res, err) }
  },
}
