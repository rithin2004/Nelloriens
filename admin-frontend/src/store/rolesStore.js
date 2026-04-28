import { rolesApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(rolesApi.getAll)
