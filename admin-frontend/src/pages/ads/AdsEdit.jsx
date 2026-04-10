import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import AdForm from '../../components/forms/AdForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { adsApi } from '../../services/api'
export default function AdsEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { adsApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await adsApi.update(id, data); toast.success('Updated!'); navigate('/ads/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="max-w-3xl"><PageHeader title="Edit Ad" backTo="/ads" /><AdForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
