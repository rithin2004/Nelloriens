import ModuleList from '../../components/common/ModuleList'
import SponsorForm from '../../components/forms/SponsorForm'
import { sponsorshipsApi } from '../../services/api'
export default function SponsorshipsList() {
  return <ModuleList title="Sponsorships" api={sponsorshipsApi} titleKey="sponsorName" FormComponent={SponsorForm} />
}
