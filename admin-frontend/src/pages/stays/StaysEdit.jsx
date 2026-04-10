import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import StayForm from '../../components/forms/StayForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { staysApi } from '../../services/api'
export default function StaysEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { staysApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await staysApi.update(id, data); toast.success('Updated!'); navigate('/stays/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="animate-fade-in"><PageHeader title="Edit Stay" backTo="/stays" /><StayForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
