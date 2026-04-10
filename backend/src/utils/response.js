/**
 * Standard response helpers
 */
export const ok     = (res, data = {}, message = 'Success')  => res.status(200).json({ success: true,  message, ...data })
export const created= (res, data = {}, message = 'Created')  => res.status(201).json({ success: true,  message, ...data })
export const badReq = (res, message = 'Bad request')          => res.status(400).json({ success: false, message })
export const notFound = (res, message = 'Not found')          => res.status(404).json({ success: false, message })
export const serverErr= (res, err)                            => {
  console.error('[SERVER ERROR]', err)
  return res.status(500).json({ success: false, message: err?.message || 'Internal server error' })
}
