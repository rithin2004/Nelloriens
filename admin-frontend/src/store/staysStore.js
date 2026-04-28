import { staysApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(staysApi.getAll)
