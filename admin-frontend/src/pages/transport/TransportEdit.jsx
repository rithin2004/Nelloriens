import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import TransportForm from '../../components/forms/TransportForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { transportApi } from '../../services/api'
export default function TransportEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { transportApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await transportApi.update(id, data); toast.success('Updated!'); navigate('/transport/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="max-w-3xl"><PageHeader title="Edit Transport" backTo="/transport" /><TransportForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
