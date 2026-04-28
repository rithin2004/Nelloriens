import { newsApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(newsApi.getAll)
