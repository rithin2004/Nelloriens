import ModuleList from '../../components/common/ModuleList'
import AdForm from '../../components/forms/AdForm'
import { adsApi } from '../../services/api'
export default function AdsList() {
  return <ModuleList title="Ads" api={adsApi} FormComponent={AdForm} />
}
