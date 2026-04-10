import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import EventForm from '../../components/forms/EventForm'; import { eventsApi } from '../../services/api'
export default function EventsCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await eventsApi.create(data); toast.success('Created!'); navigate('/events/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="animate-fade-in"><PageHeader title="Add Event" backTo="/events" /><EventForm onSubmit={handleSubmit} loading={loading} /></div>
}
