import CategoryManager from '../../components/common/CategoryManager'
import { jobsApi } from '../../services/api'

export default function JobsCategories() {
  return (
    <CategoryManager
      title="Job Categories"
      entityLabel="Category"
      getAll={() => jobsApi.getCategories()}
      create={(data) => jobsApi.createCategory(data)}
      update={(id, data) => jobsApi.updateCategory(id, data)}
      remove={(id) => jobsApi.deleteCategory(id)}
    />
  )
}
