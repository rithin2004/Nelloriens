import { jobsApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(jobsApi.getAll)
