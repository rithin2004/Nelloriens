import { eventsApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(eventsApi.getAll)
