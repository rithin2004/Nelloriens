import ModuleList from '../../components/common/ModuleList'
import SponsorForm from '../../components/forms/SponsorForm'
import { sponsorshipsApi } from '../../services/api'
import useSponsorshipsStore from '../../store/sponsorshipsStore'

export default function SponsorshipsList() {
  return (
    <ModuleList
      title="Sponsorships"
      collectionName="sponsorships"
      store={useSponsorshipsStore}
      api={sponsorshipsApi}
      titleKey="sponsorName"
      FormComponent={SponsorForm}
      idPrefix="SPN"
    />
  )
}
