import CategoryManager from '../../components/common/CategoryManager'
import TabbedManage    from '../../components/common/TabbedManage'
import { updatesApi }  from '../../services/api'

export default function UpdatesManage() {
  return (
    <TabbedManage
      title="Updates — Manage"
      tabs={[
        {
          label: 'Categories',
          content: (
            <CategoryManager
              title="Categories" entityLabel="Category" hideHeader
              getAll={()           => updatesApi.getCategories()}
              create={(data)       => updatesApi.createCategory(data)}
              update={(id, data)   => updatesApi.updateCategory(id, data)}
              remove={(id)         => updatesApi.deleteCategory(id)}
            />
          ),
        },
      ]}
    />
  )
}
