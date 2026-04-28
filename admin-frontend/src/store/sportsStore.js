import { sportsApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(sportsApi.getAll)
