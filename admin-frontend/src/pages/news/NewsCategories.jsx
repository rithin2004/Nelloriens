import CategoryManager from '../../components/common/CategoryManager'
import { newsApi } from '../../services/api'

export default function NewsCategories() {
  return (
    <CategoryManager
      title="News Categories"
      entityLabel="Category"
      getAll={() => newsApi.getCategories()}
      create={(data) => newsApi.createCategory(data)}
      update={(id, data) => newsApi.updateCategory(id, data)}
      remove={(id) => newsApi.deleteCategory(id)}
    />
  )
}
