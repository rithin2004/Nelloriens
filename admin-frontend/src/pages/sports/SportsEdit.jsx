import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import SportForm from '../../components/forms/SportForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { sportsApi } from '../../services/api'
export default function SportsEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { sportsApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await sportsApi.update(id, data); toast.success('Updated!'); navigate('/sports/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="animate-fade-in"><PageHeader title="Edit Sport" backTo="/sports" /><SportForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
