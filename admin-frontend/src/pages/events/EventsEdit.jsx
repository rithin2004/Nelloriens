import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import EventForm from '../../components/forms/EventForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { eventsApi } from '../../services/api'
export default function EventsEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { eventsApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await eventsApi.update(id, data); toast.success('Updated!'); navigate('/events/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="animate-fade-in"><PageHeader title="Edit Event" backTo="/events" /><EventForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
