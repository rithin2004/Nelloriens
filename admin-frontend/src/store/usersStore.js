import { usersApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(usersApi.getAll)
