import { realEstateApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(realEstateApi.getAll)
