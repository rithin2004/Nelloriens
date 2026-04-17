/**
 * Realtime Routes — RULE 7
 *
 * GET /realtime/sse — SSE endpoint (public, no auth required)
 * Browsers can't send custom headers via EventSource, and this endpoint
 * only exposes module names + action — no sensitive data.
 */
import express from 'express'
import { addClient, removeClient } from './realtime.service.js'

const router = express.Router()

router.get('/sse', (req, res) => {
  res.setHeader('Content-Type',       'text/event-stream')
  res.setHeader('Cache-Control',      'no-cache')
  res.setHeader('Connection',         'keep-alive')
  res.setHeader('X-Accel-Buffering',  'no')  // disable nginx buffering
  res.flushHeaders()

  // Confirm connection to client
  res.write('data: {"type":"connected"}\n\n')

  addClient(res)

  // Keep-alive ping every 30 seconds — prevents proxies / browsers from
  // closing an idle connection before any data arrives.
  const ping = setInterval(() => {
    try { res.write(': ping\n\n') }
    catch { clearInterval(ping); removeClient(res) }
  }, 30000)

  req.on('close', () => {
    clearInterval(ping)
    removeClient(res)
  })
})

export default router
