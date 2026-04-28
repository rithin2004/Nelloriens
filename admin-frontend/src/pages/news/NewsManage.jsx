import CategoryManager from '../../components/common/CategoryManager'
import TabbedManage    from '../../components/common/TabbedManage'
import { newsApi }     from '../../services/api'

export default function NewsManage() {
  return (
    <TabbedManage
      title="News — Manage"
      tabs={[
        {
          label: 'Categories',
          content: (
            <CategoryManager
              title="Categories" entityLabel="Category" hideHeader
              getAll={()           => newsApi.getCategories()}
              create={(data)       => newsApi.createCategory(data)}
              update={(id, data)   => newsApi.updateCategory(id, data)}
              remove={(id)         => newsApi.deleteCategory(id)}
            />
          ),
        },
      ]}
    />
  )
}
