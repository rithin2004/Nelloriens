import { moviesApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(moviesApi.getAll)
