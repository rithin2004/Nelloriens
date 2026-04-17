import CategoryManager from '../../components/common/CategoryManager'
import { realEstateApi } from '../../services/api'

export default function RealEstateLocations() {
  return (
    <CategoryManager
      title="Real Estate Locations"
      entityLabel="Location"
      backTo="/realestate/list"
      getAll={() => realEstateApi.getLocations()}
      create={(data) => realEstateApi.createLocation(data)}
      update={(id, data) => realEstateApi.updateLocation(id, data)}
      remove={(id) => realEstateApi.deleteLocation(id)}
    />
  )
}
