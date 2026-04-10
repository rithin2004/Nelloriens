import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import TourismForm from '../../components/forms/TourismForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { tourismApi } from '../../services/api'
export default function TourismEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { tourismApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await tourismApi.update(id, data); toast.success('Updated!'); navigate('/tourism/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="max-w-3xl"><PageHeader title="Edit Tourism Place" backTo="/tourism" /><TourismForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
