import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import TransportForm from '../../components/forms/TransportForm'; import { transportApi } from '../../services/api'
export default function TransportCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await transportApi.create(data); toast.success('Created!'); navigate('/transport/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="max-w-3xl"><PageHeader title="Add Transport" backTo="/transport" /><TransportForm onSubmit={handleSubmit} loading={loading} /></div>
}
