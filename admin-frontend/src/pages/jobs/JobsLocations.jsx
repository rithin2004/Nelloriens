import CategoryManager from '../../components/common/CategoryManager'
import { jobsApi } from '../../services/api'

export default function JobsLocations() {
  return (
    <CategoryManager
      title="Job Locations"
      entityLabel="Location"
      backTo="/jobs"
      getAll={() => jobsApi.getLocations()}
      create={(data) => jobsApi.createLocation(data)}
      update={(id, data) => jobsApi.updateLocation(id, data)}
      remove={(id) => jobsApi.deleteLocation(id)}
    />
  )
}
