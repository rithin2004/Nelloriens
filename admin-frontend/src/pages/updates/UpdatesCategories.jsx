import CategoryManager from '../../components/common/CategoryManager'
import { updatesApi } from '../../services/api'

export default function UpdatesCategories() {
  return (
    <CategoryManager
      title="Updates Categories"
      entityLabel="Category"
      backTo="/updates"
      getAll={() => updatesApi.getCategories()}
      create={(data) => updatesApi.createCategory(data)}
      update={(id, data) => updatesApi.updateCategory(id, data)}
      remove={(id) => updatesApi.deleteCategory(id)}
    />
  )
}
