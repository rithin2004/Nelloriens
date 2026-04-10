import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import UpdateForm from '../../components/forms/UpdateForm'; import { updatesApi } from '../../services/api'
export default function UpdatesCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await updatesApi.create(data); toast.success('Created!'); navigate('/updates/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="animate-fade-in"><PageHeader title="Add Update" backTo="/updates" /><UpdateForm onSubmit={handleSubmit} loading={loading} /></div>
}
