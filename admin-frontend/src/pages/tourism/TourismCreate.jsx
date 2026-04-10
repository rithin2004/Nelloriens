import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import TourismForm from '../../components/forms/TourismForm'; import { tourismApi } from '../../services/api'
export default function TourismCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await tourismApi.create(data); toast.success('Created!'); navigate('/tourism/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="animate-fade-in"><PageHeader title="Add Tourism Place" backTo="/tourism" /><TourismForm onSubmit={handleSubmit} loading={loading} /></div>
}
