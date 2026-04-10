import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import StayForm from '../../components/forms/StayForm'; import { staysApi } from '../../services/api'
export default function StaysCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await staysApi.create(data); toast.success('Created!'); navigate('/stays/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="max-w-3xl"><PageHeader title="Add Stay" backTo="/stays" /><StayForm onSubmit={handleSubmit} loading={loading} /></div>
}
