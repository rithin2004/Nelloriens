import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import ResultForm from '../../components/forms/ResultForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { resultsApi } from '../../services/api'
export default function ResultsEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { resultsApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await resultsApi.update(id, data); toast.success('Updated!'); navigate('/results/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="animate-fade-in"><PageHeader title="Edit Result" backTo="/results" /><ResultForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
