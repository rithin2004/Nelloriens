import { updatesApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(updatesApi.getAll)
