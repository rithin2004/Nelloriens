import { globalSearch } from './search.service.js'

export async function search(req, res) {
  const { q, limit } = req.query
  const results = await globalSearch(q, limit)
  res.json({ success: true, data: results, total: results.length })
}
