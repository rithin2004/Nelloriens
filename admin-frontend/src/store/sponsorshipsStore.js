import { sponsorshipsApi } from '../services/api'
import { createModuleStore } from './createModuleStore'
export default createModuleStore(sponsorshipsApi.getAll)
