import { resultsApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(resultsApi.getAll)
