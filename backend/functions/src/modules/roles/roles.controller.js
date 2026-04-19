import { rolesService, validatePermissions } from './roles.service.js'
import { badReq, forbidden }                from '../../utils/serviceBase.js'

const SUPERADMIN_ROLE_ID = 'ROL00001'

/** Normalize a role name to detect superadmin variants like super_admin, Super Admin, SUPERADMIN etc. */
function isSuperadminName(name) {
  return name.toLowerCase().replace(/[\s_-]/g, '') === 'superadmin'
}

export const rolesCtrl = {
  async list(req, res) {
    const { items, total, page, totalPages } = await rolesService.list(req.query)
    res.json({ success: true, message: 'OK', data: items, pagination: { page, total, totalPages } })
  },

  async getById(req, res) {
    const data = await rolesService.getById(req.params.id)
    res.json({ success: true, message: 'OK', data })
  },

  async create(req, res) {
    const { name, permissions = {} } = req.body
    if (!name?.trim()) badReq('name is required')
    if (isSuperadminName(name)) forbidden('Cannot create a role named superadmin')
    validatePermissions(permissions)
    const role = await rolesService.create({ name: name.trim(), permissions })
    res.status(201).json({ success: true, message: 'Created', data: role })
  },

  async update(req, res) {
    if (req.params.id === SUPERADMIN_ROLE_ID) forbidden('Superadmin role cannot be modified')
    const { name, permissions } = req.body
    if (name !== undefined && !name?.trim()) badReq('name cannot be empty')
    if (name !== undefined && isSuperadminName(name)) forbidden('Cannot rename a role to superadmin')
    if (permissions !== undefined) validatePermissions(permissions)

    const updates = {}
    if (name)        updates.name        = name.trim()
    if (permissions) updates.permissions = permissions

    const role = await rolesService.update(req.params.id, updates)
    res.json({ success: true, message: 'Updated', data: role })
  },

  async remove(req, res) {
    if (req.params.id === SUPERADMIN_ROLE_ID) forbidden('Superadmin role cannot be deleted')
    await rolesService.remove(req.params.id)
    res.json({ success: true, message: 'Role deleted', data: null })
  },
}
