import { globalSearch } from './search.service.js'
import { handleErr }    from '../../utils/serviceBase.js'

export async function search(req, res) {
  try {
    const { q, limit } = req.query
    const results = await globalSearch(q, limit)
    res.json({ success: true, data: results, total: results.length })
  } catch (err) { handleErr(res, err) }
}
