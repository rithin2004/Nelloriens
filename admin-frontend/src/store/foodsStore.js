import { foodsApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(foodsApi.getAll)
