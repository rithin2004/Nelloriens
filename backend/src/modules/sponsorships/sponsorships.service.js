import { sponsorshipsRepo } from './sponsorships.repository.js'
import { CrudService }      from '../../utils/serviceBase.js'
export const sponsorshipsService = new CrudService(sponsorshipsRepo, { entityName: 'Sponsorship' })
