import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom'; import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'; import OfferForm from '../../components/forms/OfferForm'; import LoadingSpinner from '../../components/common/LoadingSpinner'; import { offersApi } from '../../services/api'
export default function OffersEdit() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(false)
  useEffect(() => { offersApi.getById(id).then((r) => setItem(r.data)).catch(() => toast.error('Failed')) }, [id])
  const handleSubmit = async (data) => { setLoading(true); try { await offersApi.update(id, data); toast.success('Updated!'); navigate('/offers/list') } catch (e) { toast.error(e.message) } finally { setLoading(false) } }
  if (!item) return <LoadingSpinner />
  return <div className="animate-fade-in"><PageHeader title="Edit Offer" backTo="/offers" /><OfferForm defaultValues={item} onSubmit={handleSubmit} loading={loading} /></div>
}
