import { leadsRepo }          from './leads.repository.js'
import { CrudService, badReq } from '../../utils/serviceBase.js'

export const leadsService = new CrudService(leadsRepo, {
  entityName:  'Lead',
  searchField: 'name',
  orderBy:     'createdAt',
  order:       'desc',
  extraFilters: ({ status, dateFrom, dateTo }) => {
    const f = []
    if (status)   f.push(['status',    '==', status])
    if (dateFrom) f.push(['createdAt', '>=', dateFrom])
    if (dateTo)   f.push(['createdAt', '<=', dateTo])
    return f
  },
})

/** Public submission — no auth */
export async function submitLead(data) {
  const { name, email, phone, message, subject = '' } = data
  if (!name?.trim())    badReq('name is required')
  if (!email?.trim())   badReq('email is required')
  if (!message?.trim()) badReq('message is required')

  return leadsRepo.create({
    name:    name.trim(),
    email:   email.trim(),
    phone:   phone?.trim() || '',
    subject: subject.trim(),
    message: message.trim(),
    status:  'new',
  })
}
