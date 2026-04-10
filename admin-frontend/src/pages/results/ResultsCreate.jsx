import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import ResultForm from '../../components/forms/ResultForm'; import { resultsApi } from '../../services/api'
export default function ResultsCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await resultsApi.create(data); toast.success('Created!'); navigate('/results/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="max-w-3xl"><PageHeader title="Add Result" backTo="/results" /><ResultForm onSubmit={handleSubmit} loading={loading} /></div>
}
