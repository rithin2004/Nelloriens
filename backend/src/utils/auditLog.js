import { db } from '../config/firebase.js'

/**
 * Write an audit log entry to Firestore.
 * Non-blocking — errors are swallowed so they never break the main request.
 */
export async function log(req, action, module, targetId = null, meta = {}) {
  try {
    await db.collection('audit_logs').add({
      uid:       req.user?.uid    || null,
      email:     req.user?.email  || null,
      role:      req.user?.role   || null,
      action,               // 'create' | 'update' | 'delete' | 'read' | 'login' etc.
      module,               // 'news' | 'jobs' | 'settings' etc.
      targetId:  targetId || null,
      meta,                 // extra context (e.g. title of item changed)
      ip:        req.ip    || null,
      ua:        req.get('user-agent') || null,
      createdAt: new Date().toISOString(),
    })
  } catch {
    // Audit log failures must never break the main flow
  }
}
