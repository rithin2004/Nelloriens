import CategoryManager from '../../components/common/CategoryManager'
import { sportsApi } from '../../services/api'

export default function SportsCategories() {
  return (
    <CategoryManager
      title="Sport Categories"
      entityLabel="Category"
      getAll={() => sportsApi.getCategories()}
      create={(data) => sportsApi.createCategory(data)}
      update={(id, data) => sportsApi.updateCategory(id, data)}
      remove={(id) => sportsApi.deleteCategory(id)}
    />
  )
}
