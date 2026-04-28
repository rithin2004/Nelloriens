import { leadsApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(leadsApi.getAll)
