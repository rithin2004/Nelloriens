import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import SportForm from '../../components/forms/SportForm'; import { sportsApi } from '../../services/api'
export default function SportsCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await sportsApi.create(data); toast.success('Created!'); navigate('/sports/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="animate-fade-in"><PageHeader title="Add Sport" backTo="/sports" /><SportForm onSubmit={handleSubmit} loading={loading} /></div>
}
