import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import AdForm from '../../components/forms/AdForm'; import { adsApi } from '../../services/api'
export default function AdsCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await adsApi.create(data); toast.success('Created!'); navigate('/ads/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="animate-fade-in"><PageHeader title="Add Ad" backTo="/ads" /><AdForm onSubmit={handleSubmit} loading={loading} /></div>
}
