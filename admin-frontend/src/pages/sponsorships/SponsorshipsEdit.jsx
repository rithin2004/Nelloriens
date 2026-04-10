import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import SponsorForm from '../../components/forms/SponsorForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { sponsorshipsApi } from '../../services/api'
export default function SponsorshipsEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { sponsorshipsApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await sponsorshipsApi.update(id, data); toast.success('Updated!'); navigate('/sponsorships/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="animate-fade-in"><PageHeader title="Edit Sponsor" backTo="/sponsorships" /><SponsorForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
