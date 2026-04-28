import { transportApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(transportApi.getAll)
