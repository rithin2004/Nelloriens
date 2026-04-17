import CategoryManager from '../../components/common/CategoryManager'
import { tourismApi } from '../../services/api'

export default function TourismLocations() {
  return (
    <CategoryManager
      title="Tourism Locations"
      entityLabel="Location"
      backTo="/tourism/list"
      getAll={() => tourismApi.getLocations()}
      create={(data) => tourismApi.createLocation(data)}
      update={(id, data) => tourismApi.updateLocation(id, data)}
      remove={(id) => tourismApi.deleteLocation(id)}
    />
  )
}
