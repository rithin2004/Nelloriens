import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import UpdateForm from '../../components/forms/UpdateForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { updatesApi } from '../../services/api'
export default function UpdatesEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { updatesApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await updatesApi.update(id, data); toast.success('Updated!'); navigate('/updates/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="animate-fade-in"><PageHeader title="Edit Update" backTo="/updates" /><UpdateForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
