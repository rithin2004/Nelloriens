import { leadsRepo, leadInquiryTypeRepo } from './leads.repository.js'
import { CrudService, CategoryService, badReq } from '../../utils/serviceBase.js'

// RULE 23 — Status workflow: new → contacted → resolved → closed
export const LEAD_STATUSES = ['new', 'contacted', 'resolved', 'closed']

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

/** Validate and update lead status only */
export async function updateLeadStatus(id, status) {
  if (!LEAD_STATUSES.includes(status)) badReq(`status must be one of: ${LEAD_STATUSES.join(', ')}`)
  const existing = await leadsRepo.findById(id)
  if (!existing) badReq('Lead not found')
  return leadsRepo.update(id, { status })
}

export const leadInquiryTypeService = new CategoryService(leadInquiryTypeRepo, 'Inquiry type')

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
