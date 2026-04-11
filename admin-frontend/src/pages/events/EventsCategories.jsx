import CategoryManager from '../../components/common/CategoryManager'
import { eventsApi } from '../../services/api'

export default function EventsCategories() {
  return (
    <CategoryManager
      title="Event Categories"
      entityLabel="Category"
      backTo="/events"
      getAll={() => eventsApi.getCategories()}
      create={(data) => eventsApi.createCategory(data)}
      update={(id, data) => eventsApi.updateCategory(id, data)}
      remove={(id) => eventsApi.deleteCategory(id)}
    />
  )
}
