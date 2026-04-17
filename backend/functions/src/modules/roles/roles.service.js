import { rolesRepo }          from './roles.repository.js'
import { CrudService, badReq } from '../../utils/serviceBase.js'

export const rolesService = new CrudService(rolesRepo, {
  entityName:  'Role',
  searchField: 'name',
  orderBy:     'createdAt',
  order:       'asc',
})

/**
 * Validate that permissions object only uses allowed levels.
 * Shape: { moduleName: 'none' | 'read' | 'read_write' | 'full' }
 */
const VALID_LEVELS = ['none', 'read', 'read_write', 'full']

export function validatePermissions(permissions) {
  if (!permissions || typeof permissions !== 'object') return
  for (const [mod, level] of Object.entries(permissions)) {
    if (!VALID_LEVELS.includes(level)) {
      badReq(`Invalid permission level "${level}" for module "${mod}". Allowed: ${VALID_LEVELS.join(', ')}`)
    }
  }
}
