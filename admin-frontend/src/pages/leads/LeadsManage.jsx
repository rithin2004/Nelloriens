import CategoryManager from '../../components/common/CategoryManager'
import TabbedManage    from '../../components/common/TabbedManage'
import { leadsApi }    from '../../services/api'

export default function LeadsManage() {
  return (
    <TabbedManage
      title="Leads — Manage"
      tabs={[
        {
          label: 'Inquiry Types',
          content: (
            <CategoryManager
              title="Inquiry Types" entityLabel="Inquiry Type" hideHeader
              getAll={()           => leadsApi.getInquiryTypes()}
              create={(data)       => leadsApi.createInquiryType(data)}
              update={(id, data)   => leadsApi.updateInquiryType(id, data)}
              remove={(id)         => leadsApi.deleteInquiryType(id)}
            />
          ),
        },
      ]}
    />
  )
}
