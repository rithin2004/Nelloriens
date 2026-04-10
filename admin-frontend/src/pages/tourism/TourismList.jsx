import ModuleList from '../../components/common/ModuleList'
import TourismForm from '../../components/forms/TourismForm'
import { tourismApi } from '../../services/api'
export default function TourismList() {
  return <ModuleList title="Tourism" api={tourismApi} titleKey="placeName" FormComponent={TourismForm} />
}
