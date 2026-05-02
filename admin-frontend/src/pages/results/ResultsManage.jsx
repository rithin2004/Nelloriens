import CategoryManager from '../../components/common/CategoryManager'
import TabbedManage    from '../../components/common/TabbedManage'
import { resultsApi }  from '../../services/api'

export default function ResultsManage() {
  return (
    <TabbedManage
      title="Results — Manage"
      backTo="/results/list"
      tabs={[
        {
          label: 'Categories',
          content: (
            <CategoryManager
              title="Categories" entityLabel="Category" hideHeader
              getAll={()           => resultsApi.getCategories()}
              create={(data)       => resultsApi.createCategory(data)}
              update={(id, data)   => resultsApi.updateCategory(id, data)}
              remove={(id)         => resultsApi.deleteCategory(id)}
            />
          ),
        },
      ]}
    />
  )
}
