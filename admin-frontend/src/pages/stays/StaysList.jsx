import ModuleList from '../../components/common/ModuleList'
import StayForm from '../../components/forms/StayForm'
import { staysApi } from '../../services/api'
export default function StaysList() {
  return <ModuleList title="Stays" api={staysApi} titleKey="hotelName" FormComponent={StayForm} />
}
