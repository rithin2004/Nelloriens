import CategoryManager from '../../components/common/CategoryManager'
import { transportApi } from '../../services/api'

export default function TransportCategories() {
  return (
    <CategoryManager
      title="Transport Categories"
      entityLabel="Category"
      backTo="/transport"
      getAll={() => transportApi.getCategories()}
      create={(data) => transportApi.createCategory(data)}
      update={(id, data) => transportApi.updateCategory(id, data)}
      remove={(id) => transportApi.deleteCategory(id)}
    />
  )
}
