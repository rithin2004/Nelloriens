import CategoryManager from '../../components/common/CategoryManager'
import { realEstateApi } from '../../services/api'

export default function RealEstatePropertyTypes() {
  return (
    <CategoryManager
      title="Property Types"
      entityLabel="Property Type"
      backTo="/realestate/list"
      getAll={() => realEstateApi.getTypes()}
      create={(data) => realEstateApi.createType(data)}
      update={(id, data) => realEstateApi.updateType(id, data)}
      remove={(id) => realEstateApi.deleteType(id)}
    />
  )
}
