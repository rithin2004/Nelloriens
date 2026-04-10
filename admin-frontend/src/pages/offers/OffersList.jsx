import ModuleList from '../../components/common/ModuleList'
import OfferForm from '../../components/forms/OfferForm'
import { offersApi } from '../../services/api'
export default function OffersList() {
  return <ModuleList title="Offers" api={offersApi} FormComponent={OfferForm} />
}
