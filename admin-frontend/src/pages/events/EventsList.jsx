import ModuleList from '../../components/common/ModuleList'
import EventForm from '../../components/forms/EventForm'
import { eventsApi } from '../../services/api'
export default function EventsList() {
  return <ModuleList title="Events" api={eventsApi} titleKey="eventName" FormComponent={EventForm} />
}
