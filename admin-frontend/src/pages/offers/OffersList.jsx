import ModuleList from '../../components/common/ModuleList'
import OfferForm from '../../components/forms/OfferForm'
import { offersApi } from '../../services/api'
import useOffersStore from '../../store/offersStore'

export default function OffersList() {
  return (
    <ModuleList
      title="Offers"
      collectionName="offers"
      store={useOffersStore}
      api={offersApi}
      FormComponent={OfferForm}
      idPrefix="OFR"
    />
  )
}
