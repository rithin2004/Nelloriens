import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import JobForm from '../../components/forms/JobForm'
import { jobsApi } from '../../services/api'
export default function JobsCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await jobsApi.create(data); toast.success('Job created!'); navigate('/jobs/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="animate-fade-in"><PageHeader title="Add Job" backTo="/jobs" /><JobForm onSubmit={handleSubmit} loading={loading} /></div>
}
