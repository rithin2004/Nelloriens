import CategoryManager from '../../components/common/CategoryManager'
import TabbedManage    from '../../components/common/TabbedManage'
import { sportsApi }   from '../../services/api'

export default function SportsManage() {
  return (
    <TabbedManage
      title="Sports — Manage"
      backTo="/sports/list"
      tabs={[
        {
          label: 'Categories',
          content: (
            <CategoryManager
              title="Categories" entityLabel="Category" hideHeader
              getAll={()           => sportsApi.getCategories()}
              create={(data)       => sportsApi.createCategory(data)}
              update={(id, data)   => sportsApi.updateCategory(id, data)}
              remove={(id)         => sportsApi.deleteCategory(id)}
            />
          ),
        },
      ]}
    />
  )
}
