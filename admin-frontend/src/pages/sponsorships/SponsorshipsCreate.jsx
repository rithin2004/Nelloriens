import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import SponsorForm from '../../components/forms/SponsorForm'; import { sponsorshipsApi } from '../../services/api'
export default function SponsorshipsCreate() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false)
  const handleSubmit = async (data) => { setLoading(true); try { await sponsorshipsApi.create(data); toast.success('Created!'); navigate('/sponsorships/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  return <div className="animate-fade-in"><PageHeader title="Add Sponsor" backTo="/sponsorships" /><SponsorForm onSubmit={handleSubmit} loading={loading} /></div>
}
