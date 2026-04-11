import CategoryManager from '../../components/common/CategoryManager'
import { resultsApi } from '../../services/api'

export default function ResultsCategories() {
  return (
    <CategoryManager
      title="Results Categories"
      entityLabel="Category"
      backTo="/results"
      getAll={() => resultsApi.getCategories()}
      create={(data) => resultsApi.createCategory(data)}
      update={(id, data) => resultsApi.updateCategory(id, data)}
      remove={(id) => resultsApi.deleteCategory(id)}
    />
  )
}
