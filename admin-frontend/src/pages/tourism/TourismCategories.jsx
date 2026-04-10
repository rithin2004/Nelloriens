import CategoryManager from '../../components/common/CategoryManager'
import { tourismApi } from '../../services/api'

export default function TourismCategories() {
  return (
    <CategoryManager
      title="Tourism Categories"
      entityLabel="Category"
      getAll={() => tourismApi.getCategories()}
      create={(data) => tourismApi.createCategory(data)}
      update={(id, data) => tourismApi.updateCategory(id, data)}
      remove={(id) => tourismApi.deleteCategory(id)}
    />
  )
}
