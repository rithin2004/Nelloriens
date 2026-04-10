import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import JobForm from '../../components/forms/JobForm'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { jobsApi } from '../../services/api'
export default function JobsEdit() {
  const { id } = useParams(); const navigate = useNavigate()
  const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { jobsApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed to load')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await jobsApi.update(id, data); toast.success('Updated!'); navigate('/jobs/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="max-w-3xl"><PageHeader title="Edit Job" backTo="/jobs" /><JobForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
